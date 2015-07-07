#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
#   Copyright 2015 Futur Solo
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.


from tornado.web import *
from tornado.gen import *
from foundation.place import PlacesOfInterest, slug_validation, visitor_only
from collections import OrderedDict
import foundation.pyotp as pyotp
import json


class ManagementOffice(PlacesOfInterest):
    def management_url(self, path, include_host=None, **kwargs):
        path = "management/" + path
        return RequestHandler.static_url(
            self, path, include_host=include_host, **kwargs)

    def checkin_status(self, code=None):
        if not hasattr(self, ("_checkin_status")):
            self._checkin_status = self.get_scookie(
                "checkin_status", arg_type="hash", default="ok")
            self.clear_cookie("checkin_status")
        if code is None:
            return (self._checkin_status != "ok")
        return (code == self._checkin_status)

    @coroutine
    def checkin(self, username, password, two):
        user = yield self.get_user(username=username)
        if (not user) or (self.hash(password, "sha1") != user["password"]):
            return [False, "password"]
        if not (self.verify_otp(two, key=user["otp_key"])):
            return [False, "two"]
        device_id = self.get_random(32)
        return [
            True, {
                "user_id": user["_id"],
                "device_id": device_id,
                "agent_auth": self.hash((device_id + user["password"]),
                                        "sha256")
            }]

    def verify_otp(self, code, key=None):
        if not key:
            key = self.current_user["otp_key"]
        totp = pyotp.TOTP(key)
        return totp.verify(code)

    def management_render(self, page):
        self.render_list["management_url"] = self.management_url
        self.render_list["checkin_status"] = self.checkin_status
        if "page_title" not in self.render_list.keys():
            self.render_list["page_title"] = (
                self.render_list["origin_title"] +
                " - " + self.config["office_name"])
        page = "management/" + page
        self.finish(self.render_string(page, **self.render_list))


class CheckinOffice(ManagementOffice):
    @coroutine
    @visitor_only
    def get(self):
        self.render_list["origin_title"] = "登录"
        self.management_render("checkin.htm")

    @coroutine
    @visitor_only
    def post(self):
        username = self.get_arg("username", arg_type="username")
        password = self.get_arg("password", arg_type="hash")
        two = self.get_arg("two", arg_type="number")
        remember = self.get_arg("remember", arg_type="boolean")
        if not (username and password and two):
            self.set_scookie("checkin_status", "password", expires_days=None)
            self.redirect("/management/checkin")
            return
        result = yield self.checkin(
            username=username, password=password, two=two)
        if result[0]:
            expires_days = None
            if remember:
                expires_days = 180
            self.set_scookie(
                "user_id", result[1]["user_id"],
                expires_days=expires_days, httponly=True)
            self.set_scookie(
                "device_id", result[1]["device_id"],
                expires_days=expires_days, httponly=True)
            self.set_scookie(
                "agent_auth", result[1]["agent_auth"],
                expires_days=expires_days, httponly=True)
            self.redirect(self.next_url)
        else:
            self.set_scookie("checkin_status", result[1], expires_days=None)
            self.redirect("/management/checkin")


class CheckoutOffice(ManagementOffice):
    @authenticated
    def get(self):
        self.clear_cookie("user_id")
        self.clear_cookie("device_id")
        self.clear_cookie("agent_auth")
        self.redirect(self.next_url)


class CRDAOffice(ManagementOffice):
    @coroutine
    @authenticated
    @slug_validation(["hash"])
    def get(self, area):
        if area == "writings":
            book = self.memories.select("Writings")
            self.render_list["origin_title"] = "检视文章"
        elif area == "pages":
            book = self.memories.select("Pages")
            self.render_list["origin_title"] = "检视页面"
        elif area == "replies":
            book = self.memories.select("Replies")
            self.render_list["origin_title"] = "检视评论"
        else:
            raise HTTPError(404)
        self.render_list["area"] = area
        book.find({})
        book.sort([["time", False]])
        book.length(0, True)
        yield book.do()
        content_list = book.result()
        writing_list = []
        for key in content_list:
            if area == "writings":
                content_list[key]["edit_link"] = (
                    "/management/working/edit?type=writing&id=" +
                    str(int(content_list[key]["_id"])))
            elif area == "pages":
                content_list[key]["edit_link"] = (
                    "/management/working/edit?type=page&id=" +
                    str(int(content_list[key]["_id"])))
            elif area == "replies":
                content_list[key]["content"] = self.make_md(
                    content_list[key]["content"])
                content_list[key]["_id"] = int(
                    content_list[key]["_id"])
                if content_list[key]["writing_id"] not in writing_list:
                    writing_list.append(content_list[key]["writing_id"])
        if area == "replies":
            writing_list = yield self.get_writing(writing_list=writing_list)
            for key in content_list:
                if content_list[key]["writing_id"] not in writing_list.keys():
                    del content_list[key]
                    continue
                content_list[key]["writing"] = writing_list[
                    content_list[key]["writing_id"]]
        self.render_list["content"] = content_list
        self.render_list["page_title"] = (
            self.render_list["origin_title"] +
            " - " + self.config["office_name"] + self.config["crda_name"])
        self.management_render("crda.htm")

    @coroutine
    @authenticated
    @slug_validation(["hash"])
    def post(self, area):
        if area == "writings":
            book = self.memories.select("Writings")
            raise HTTPError(500)
        elif area == "pages":
            book = self.memories.select("Pages")
            raise HTTPError(500)
        elif area == "replies":
            book = self.memories.select("Replies")
            action = self.get_arg("action", arg_type="hash")
            if action == "edit":
                reply_id = self.get_arg("reply", arg_type="number")
                reply_name = self.get_arg("name", arg_type="origin")
                reply_homepage = self.get_arg("homepage", arg_type="origin")
                reply_email = self.get_arg("email", arg_type="mail_address")
                reply_content = self.get_arg("content", arg_type="origin")
                if not (reply_id and reply_name and reply_homepage and
                        reply_email and reply_content):
                    raise HTTPError(500)
                reply = {}
                reply["name"] = reply_name
                reply["homepage"] = reply_homepage
                reply["email"] = reply_email
                reply["content"] = reply_content
                book.set({"_id": reply_id}, reply)
                yield book.do()
                self.redirect("/management/crda/replies")
        else:
            raise HTTPError(500)


class ControlOffice(ManagementOffice):
    @coroutine
    @authenticated
    def get(self):
        book = self.memories.select("Configs")
        book.find({})
        book.length(0, True)
        yield book.do()
        configs = book.result()
        self.render_list["configs"] = configs
        self.render_list["origin_title"] = "变更设置"
        self.render_list["page_title"] = (
            self.render_list["origin_title"] +
            " - " + self.config["office_name"] +
            self.config["configuration_name"])
        self.management_render("configuration.htm")

    @coroutine
    @authenticated
    def post(self):
        post_config = OrderedDict()
        post_config["site_name"] = self.get_arg("site_name", arg_type="origin")
        post_config["site_description"] = self.get_arg(
            "site_description", arg_type="origin")
        post_config["site_keywords"] = self.get_arg(
            "site_keywords", arg_type="origin")
        post_config["site_url"] = self.get_arg("site_url", arg_type="link")
        post_config["nutrition_type"] = self.get_arg(
            "nutrition_type", arg_type="hash")
        post_config["trace_code"] = self.get_arg(
            "trace_code", arg_type="origin")
        for key in post_config:
            if not post_config[key]:
                raise HTTPError(500)
        book = self.memories.select("Configs")
        book.find({}).length(0, force_dict=True)
        yield book.do()
        origin_config = book.result()
        for key in post_config:
            if origin_config[key] != post_config[key]:
                book.set({"_id": key}, {"value": post_config[key]})
                yield book.do()
        self.redirect("/management/rerise")


class ReriseOffice(ManagementOffice):
    @authenticated
    def get(self):
        self.render_list["origin_title"] = "重新启动"
        self.management_render("rerise.htm")


class NewOffice(ManagementOffice):
    @coroutine
    @authenticated
    def get(self, slug, sub_slug=""):
        self.render_list["origin_title"] = ""
        self.render_list["page_title"] = self.config["office_name"]
        self.render_list["slug"] = slug
        self.render_list["sub_slug"] = sub_slug
        self.management_render("office.htm")


class WorkingOffice(ManagementOffice):
    @coroutine
    @authenticated
    @slug_validation(["hash"])
    def get(self, method):
        self.render_list["method"] = method
        if method == "new":
            self.render_list["pre_working"] = None
            self.render_list["origin_title"] = "进行创作"
        elif method == "edit":
            working_type = self.get_arg("type", arg_type="hash")
            working_id = self.get_arg("id", arg_type="number")
            if working_type == "writing":
                book = self.memories.select("Writings")
            elif working_type == "page":
                book = self.memories.select("Pages")
            else:
                raise HTTPError(404)
            book.find({"_id": working_id})
            yield book.do()
            working = book.result()
            working["type"] = working_type
            self.render_list["pre_working"] = working
            self.render_list["origin_title"] = "修改作品"
        else:
            raise HTTPError(404)
        self.render_list["page_title"] = (
            self.render_list["origin_title"] +
            " - " + self.config["office_name"] + self.config["working_name"])
        self.management_render("working.htm")


class ActionOffice(ManagementOffice):
    @coroutine
    @authenticated
    def post(self):
        action = self.get_arg("action", default=None, arg_type="link")
        if hasattr(self, action):
            yield getattr(self, action)()
        else:
            raise HTTPError(500)

    @coroutine
    def count(self):
        info = yield self.get_count()
        self.finish(json.dumps(info))

    @coroutine
    def save_working(self):
        working_type = self.get_arg("working_type", arg_type="hash")
        if working_type == "writing":
            book = self.memories.select("Writings")
        elif working_type == "page":
            book = self.memories.select("Pages")
        else:
            raise HTTPError(500)

        working_method = self.get_arg("working_method", arg_type="hash")

        working_id = self.get_arg("working_id", arg_type="number")

        def make_working():
            working = {}
            working["title"] = self.get_arg("working_title", arg_type="origin")
            working["content"] = self.get_arg("working_content",
                                              arg_type="origin")
            working["time"] = self.get_arg("working_time", arg_type="number")
            working["publish"] = self.get_arg("working_publish",
                                              arg_type="boolean")
            working["slug"] = self.get_arg("working_slug", arg_type="slug")
            working["author"] = self.current_user["_id"]
            if not working["slug"]:
                raise HTTPError(500)
            return working

        def check_slug(slug):
            book.find({"slug": slug})
            yield book.do()
            slug_result = book.result()
            if slug_result and (
             slug_result is not False and slug_result["_id"] != working_id):
                self.finish(json.dumps({"succeed": False, "reason": "slug"}))
                return False
            return True

        if working_method == "new":
            working = make_working()
            if not check_slug(working["slug"]):
                return
            if working_type == "writing":
                working_id = yield self.issue_id("Writings")
            elif working_type == "page":
                working_id = yield self.issue_id("Pages")
            else:
                raise HTTPError(500)
            working["_id"] = working_id
            book.add(working)
        elif working_method == "edit":
            working = make_working()
            if not check_slug(working["slug"]):
                return
            book.set({"_id": working_id}, working)
        elif working_method == "erase":
            @coroutine
            def erase_reply(working_id):
                book = self.memories.select("Replies")
                book.erase({"writing_id": working_id})
                yield book.do()
            if working_type == "writing":
                yield erase_reply(working_id)
            book.erase({"_id": working_id})
        else:
            raise HTTPError(500)
        yield book.do()
        self.finish(json.dumps({
            "succeed": True,
            "id": working_id,
        }))

    @coroutine
    def load_working(self):
        working_type = self.get_arg("type", arg_type="hash")
        working_id = self.get_arg("id", arg_type="number")
        if working_type == "writing":
            book = self.memories.select("Writings")
        elif working_type == "page":
            book = self.memories.select("Pages")
        else:
            raise HTTPError(500)
        book.find({"_id": working_id})
        yield book.do()
        working = book.result()
        self.finish(json.dumps(working))

    @coroutine
    def load_crda(self):
        type = self.get_arg("type", arg_type="hash")

        if type == "writings":
            book = self.memories.select("Writings")
            book.find({}, ["content"])
        elif type == "pages":
            book = self.memories.select("Pages")
            book.find({}, ["content"])
        elif type == "replies":
            book = self.memories.select("Replies")
            book.find({})
            writing_list = []
        else:
            raise HTTPError(500)

        book.sort([["time", False]])
        book.length(0, True)
        yield book.do()
        content_list = book.result()

        if type == "replies":
            for key in content_list:
                content_list[key]["content"] = self.make_md(
                    content_list[key]["content"])
                content_list[key]["_id"] = int(
                    content_list[key]["_id"])
                if content_list[key]["writing_id"] not in writing_list:
                    writing_list.append(content_list[key]["writing_id"])

            writing_list = yield self.get_writing(writing_list=writing_list)
            for key in content_list:
                if content_list[key]["writing_id"] not in writing_list.keys():
                    del content_list[key]
                    continue
                content_list[key]["writing"] = writing_list[
                    content_list[key]["writing_id"]]

        self.finish(json.dumps(list(content_list.values())))

    @coroutine
    def save_reply(self):
        reply_id = self.get_arg("reply", arg_type="number")
        reply_method = self.get_arg("method", arg_type="hash")
        book = self.memories.select("Replies")

        if reply_method == "permit":
            permit = self.get_arg("permit", arg_type="boolean")
            if permit is None:
                raise HTTPError(500)

            book.find({"_id": reply_id})
            yield book.do()
            reply = book.result()
            if not reply:
                raise HTTPError(500)

            book.set({"_id": reply_id}, {"permit": permit})
            yield book.do()
            self.finish(json.dumps({"status": True}))

        elif reply_method == "erase":
            book.erase({"_id": reply_id})
            yield book.do()
            self.finish(json.dumps({"status": True}))

        elif reply_method == "edit":
            reply_name = self.get_arg("name", arg_type="origin")
            reply_homepage = self.get_arg("homepage", arg_type="origin")
            reply_email = self.get_arg("email", arg_type="mail_address")
            reply_content = self.get_arg("content", arg_type="origin")
            if not (reply_id and reply_name and reply_homepage and
                    reply_email and reply_content):
                raise HTTPError(500)
            reply = {}
            reply["name"] = reply_name
            reply["homepage"] = reply_homepage
            reply["email"] = reply_email
            reply["content"] = reply_content
            book.set({"_id": reply_id}, reply)
            yield book.do()
            self.finish(json.dumps({"status": True}))

    @coroutine
    def load_configuration(self):
        book = self.memories.select("Configs")
        book.find({})
        book.length(0, True)
        yield book.do()
        configs = book.result()
        self.finish(json.dumps(configs))

    @coroutine
    def save_configuration(self):
        post_config = OrderedDict()
        post_config["site_name"] = self.get_arg("site_name", arg_type="origin")
        post_config["site_description"] = self.get_arg(
            "site_description", arg_type="origin")
        post_config["site_keywords"] = self.get_arg(
            "site_keywords", arg_type="origin")
        post_config["site_url"] = self.get_arg("site_url", arg_type="link")
        post_config["nutrition_type"] = self.get_arg(
            "nutrition_type", arg_type="hash")
        post_config["trace_code"] = self.get_arg(
            "trace_code", arg_type="origin")
        for key in post_config:
            if not post_config[key]:
                raise HTTPError(500)
        book = self.memories.select("Configs")
        book.find({}).length(0, force_dict=True)
        yield book.do()
        origin_config = book.result()
        for key in post_config:
            if origin_config[key] != post_config[key]:
                book.set({"_id": key}, {"value": post_config[key]})
                yield book.do()
        self.finish(json.dumps({"status": True}))

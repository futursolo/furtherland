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
            raise Return([False, "password"])
        if not (self.verify_otp(two, key=user["otp_key"])):
            raise Return([False, "two"])
        device_id = self.get_random(32)
        raise Return([
            True, {
                "user_id": user["_id"],
                "device_id": device_id,
                "agent_auth": self.hash((device_id + user["password"]),
                                        "sha256")
            }])

    def verify_otp(self, code, key=None):
        if not key:
            key = self.current_user["otp_key"]
        totp = pyotp.TOTP(key)
        return totp.verify(code)

    def management_render(self, page):
        self.render_list["management_url"] = self.management_url
        self.render_list["checkin_status"] = self.checkin_status
        if "page_title" not in list(self.render_list.keys()):
            self.render_list["page_title"] = (
                self.render_list["origin_title"] +
                " - " + self.config["site_name"] + "管理局")
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
                expires_days=expires_days)
            self.set_scookie(
                "device_id", result[1]["device_id"],
                expires_days=expires_days)
            self.set_scookie(
                "agent_auth", result[1]["agent_auth"],
                expires_days=expires_days)
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


class LobbyOffice(ManagementOffice):
    @coroutine
    @authenticated
    def get(self):
        self.render_list["count"] = yield self.get_count()
        self.render_list["origin_title"] = self.config["lobby_name"]
        self.management_render("lobby.htm")


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

    @coroutine
    @authenticated
    @slug_validation(["hash"])
    def post(self, method):
        working = {}
        working_type = self.get_arg("working_type", arg_type="hash")
        if working_type == "writing":
            book = self.memories.select("Writings")
        elif working_type == "page":
            book = self.memories.select("Pages")
        else:
            raise HTTPError(404)
        working_title = self.get_arg("working_title", arg_type="origin")
        working_content = self.get_arg("working_content", arg_type="origin")
        working_method = self.get_arg("working_method", arg_type="hash")
        working_time = self.get_arg("working_time", arg_type="number")
        working_publish = self.get_arg("working_publish", arg_type="boolean")
        working_slug = self.get_arg("working_slug", arg_type="slug")

        working["title"] = working_title
        working["time"] = working_time
        working["publish"] = working_publish
        working["content"] = working_content
        working["slug"] = working_slug
        working["author"] = self.current_user["_id"]

        if working_method == "new":
            if working_type == "writing":
                working_id = yield self.issue_id("Writings")
            elif working_type == "page":
                working_id = yield self.issue_id("Pages")
            else:
                raise HTTPError(500)
            if not working_slug:
                working_slug = str(working_id)
            working["_id"] = working_id
            book.add(working)
        elif working_method == "edit":
            working_id = self.get_arg("working_id")
            if not working_slug:
                working_slug = str(working_id)
            working_id = self.get_arg("working_id", arg_type="number")
            book.set({"_id": working_id}, working)
        yield book.do()
        self.redirect(
            "/management/working/edit?type=" +
            working_type + "&id=" + str(working_id)
        )


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
        self.render_list["content"] = content_list
        self.render_list["page_title"] = (
            self.render_list["origin_title"] +
            " - " + self.config["office_name"] + self.config["crda_name"])
        self.management_render("crda.htm")


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
        nutrition_type = self.get_arg("nutrition_type", arg_type="hash")
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
        self.redirect("/management/configuration")

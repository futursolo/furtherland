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


class ManagementOffice(PlacesOfInterest):
    @coroutine
    def prepare(self):
        self.render_list["management_url"] = self.management_url
        self.render_list["checkin_status"] = self.checkin_status
        yield PlacesOfInterest.prepare(self)

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
        self.render_list["origin_title"] = "大厅"
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
            self.render_list["origin_title"] = "修改作品"
        else:
            raise HTTPError(404)
        self.render_list["page_title"] = (
            self.render_list["origin_title"] +
            " - " + self.config["site_name"] + "管理局" + "工作室")
        self.management_render("working.htm")

    @coroutine
    @authenticated
    @slug_validation(["hash"])
    def post(self, method):
        working_id = self.get_arg("working_id", arg_type="number")
        working_title = self.get_arg("working_title", arg_type="origin")
        working_content = self.get_arg("working_content", arg_type="origin")
        working_method = self.get_arg("working_method", arg_type="hash")
        working_time = self.get_arg("working_time", arg_type="hash")
        working_status = self.get_arg("working_status", arg_type="hash")
        working_slug = self.get_arg("working_slug", arg_type="hash")
        working_publish = self.get_arg("working_publish", arg_type="hash")
        working_type = self.get_arg("working_type", arg_type="hash")

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
import re
import misaka
import hashlib
import base64
import foundation.pyotp as pyotp
import random
import string
import functools
import mako.lookup
import mako.template


def decorator_with_args(decorator_to_enhance):
    def decorator_maker(*args, **kwargs):
        def decorator_wrapper(func):
            return decorator_to_enhance(func, *args, **kwargs)
        return decorator_wrapper
    return decorator_maker


@decorator_with_args
def slug_validation(func, *args, **kwargs):
    @functools.wraps(func)
    def wrapper(self, *func_args, **func_kwargs):
        valid_list = args[0]
        new_slug = []
        for number in range(0, len(valid_list)):
            try:
                new_slug.append(self.value_validation(
                    valid_list[number], func_args[number]))
            except:
                raise HTTPError(404)
        return func(self, *new_slug, **func_kwargs)
    return wrapper


def visitor_only(func):
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        if self.current_user:
            self.redirect(self.next_url)
            return
        return func(self, *args, **kwargs)
    return wrapper


class GreetingPlace(RequestHandler):
    current_user = None

    @coroutine
    def prepare(self):
        self.render_list = {}
        self.memories = self.settings["historial_records"]
        self.current_user = yield self.get_current_user()
        self.config = yield self.get_config()

        self.next_url = self.get_arg("next", arg_type="link", default="/")
        self.remote_ip = self.request.headers.get(
            "X-Forwarded-For",
            self.request.headers.get(
                "X-Real-Ip", self.request.remote_ip))
        self.using_ssl = (self.request.headers.get(
            "X-Scheme", "http") == "https")

    @coroutine
    def get_config(self):
        if not hasattr(self, "_config"):
            book = self.memories.select("Configs")
            book.find().length(0)
            yield book.do()
            self._config = {}
            result = book.result()
            for key in result:
                self._config[result[key]["_id"]] = result[key]["value"]
        raise Return(self._config)

    @coroutine
    def get_current_user(self):
        if not hasattr(self, "_current_user"):
            user_id = self.get_scookie("user_id", arg_type="number")
            device_id = self.get_scookie("device_id", arg_type="hash")
            agent_auth = self.get_scookie("agent_auth", arg_type="hash")
            if not (user_id and device_id and agent_auth):
                self._current_user = None
            else:
                user = yield self.get_user(_id=user_id)
                if self.hash((device_id + user["password"]),
                             "sha256") != agent_auth:
                    self._current_user = None
                else:
                    self._current_user = user
            raise Return(self._current_user)

    def get_arg(self, arg, default=None, arg_type="origin"):
        result = RequestHandler.get_argument(self, arg, None)
        try:
            result = str(result.decode())
        except:
            try:
                result = str(result)
            except:
                pass
        if (not result) or (result == "None"):
            return default
        else:
            return self.value_validation(arg_type, result)

    def get_scookie(self, arg, default=None, arg_type="origin"):
        result = RequestHandler.get_secure_cookie(
            self, arg, None, max_age_days=181)
        if not result:
            return default
        try:
            result = str(result.decode())
        except:
            try:
                result = str(result)
            except:
                pass
        if (not result) or (result == "None"):
            return default
        else:
            return self.value_validation(arg_type, result)

    def set_scookie(self, arg, value="", expires_days=30):
        str_value = ""
        try:
            str_value = str(value.decode())
        except:
            try:
                str_value = str(value)
            except:
                str_value = value
        RequestHandler.set_secure_cookie(self, arg, str_value, expires_days)

    def value_validation(self, arg_type, value):
        if arg_type == "origin":
            return value
        elif arg_type == "mail_address":
            mail_address = str(value)
            if re.match(
             r"^([\._+\-a-zA-Z0-9]+)@{1}([a-zA-Z0-9\-]+)\.([a-zA-Z0-9\-]+)$",
             mail_address) == None:
                return False
            else:
                return mail_address
        elif arg_type == "hash":
            hash_value = str(value)
            if re.match(r"^([a-zA-Z0-9]+)$", hash_value) == None:
                return False
            else:
                return hash_value
        elif arg_type == "number":
            number = str(value)
            if re.match(r"^([\-\+0-9]+)$", number) == None:
                return False
            else:
                return int(number)
        elif arg_type == "boolean":
            boo = str(value).lower()
            if boo == "1" or boo == "true" or boo == "on":
                return True
            else:
                return False
        elif arg_type == "username":
            string = str(value)
            if re.match(r"^([ a-zA-Z]+)$", string) == None:
                return False
            else:
                return string
        elif arg_type == "link":
            link = str(value)
            if re.match(r"^(.*)$", link) == None:
                return False
            else:
                return link

    def hash(self, target, method):
        target = base64.b64encode(target.encode(encoding="utf-8"))
        if method == "sha1":
            return hashlib.sha1(target).hexdigest()
        if method == "sha256":
            return hashlib.sha256(target).hexdigest()
        if method == "md5":
            return hashlib.md5(target).hexdigest()

    @coroutine
    def get_user(self, **kwargs):
        book = self.memories.select("Users")
        condition = list(kwargs.keys())[0]
        if condition != "user_list":
            value = kwargs[condition]
            book.find({condition: value}).length(1)
        yield book.do()
        raise Return(book.result())

    def get_random(self, length):
        return "".join(random.sample(string.ascii_letters + string.digits,
                                     length))

    def checkin_status(self, code=None):
        if not hasattr(self, ("_checkin_status")):
            self._checkin_status = self.get_scookie(
                "checkin_status", arg_type="hash", default="ok")
            self.clear_cookie("checkin_status")
        if code is None:
            return (self._checkin_status != "ok")
        return (code == self._checkin_status)

    @coroutine
    def get_class(self):
        pass

    @coroutine
    def get_writing(self):
        pass

    @coroutine
    def get_reply(self):
        pass

    @coroutine
    def get_bread(self):
        pass

    @coroutine
    def issue_id(self):
        pass

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

    def make_md(self):
        return misaka.html()

    def static_url(self, path, include_host=None, nutrition=True, **kwargs):
        if nutrition:
            path = "nutrition/" + self.config["nutrition_type"] + "/" + path
        return RequestHandler.static_url(
            self, path, include_host=include_host, **kwargs)

    def render_string(self, filename, **kwargs):
        lookup = mako.lookup.TemplateLookup(
            [self.settings["template_path"]],
            input_encoding="utf-8",
            output_encoding="utf-8",
            default_filters=["decode.utf_8"],
            module_directory=(self.settings["root_path"] + "/rubbish/mako")
            )
        template = lookup.get_template(filename)
        env_kwargs = {
            "handler": self,
            "request": self.request,
            "current_user": self.current_user,
            "locale": self.locale,
            "_": self.locale.translate,
            "xsrf_form_html": self.xsrf_form_html,
            "reverse_url": self.application.reverse_url,
            "config": self.config,
            "static_url": self.static_url,
            "management_url": self.management_url,
            "FurtherLand": self.settings["further_land"],
            "checkin_status": self.checkin_status
            }
        env_kwargs.update(kwargs)
        return template.render(**env_kwargs)

    def render(self, page, nutrition=True):
        if "page_title" not in list(self.render_list.keys()):
            self.render_list["page_title"] = (
                self.render_list["origin_title"] +
                " - " + self.config["site_name"])
        if nutrition:
            page = "nutrition/" + self.config["nutrition_type"] + "/" + page
        self.finish(self.render_string(page, **self.render_list))

    def management_render(self, page):
        if "page_title" not in list(self.render_list.keys()):
            self.render_list["page_title"] = (
                self.render_list["origin_title"] +
                " - " + self.config["site_name"] + "管理局")
        page = "management/" + page
        self.finish(self.render_string(page, **self.render_list))

    def management_url(self, path, include_host=None, **kwargs):
        path = "management/" + path
        return RequestHandler.static_url(
            self, path, include_host=include_host, **kwargs)

    @coroutine
    def get_count(self):
        result = {}
        book = self.memories.select("Writings").count()
        yield book.do()
        result["writings"] = book.result()
        book = self.memories.select("Replies").count()
        yield book.do()
        result["replies"] = book.result()
        book = self.memories.select("Pages").count()
        yield book.do()
        result["pages"] = book.result()
        return result


class IndexPlace(GreetingPlace):
    @coroutine
    def get(self):
        self.render_list["origin_title"] = "首页"
        self.render("index.htm")


class WritingsPlace(GreetingPlace):
    pass


class HistoryLibrary(GreetingPlace):
    pass


class SpiritPlace(StaticFileHandler):
    @coroutine
    def get(self, path, include_body=True):
        if re.match(r"^(.*)\.(htm|json|tpl|csv|mo|po|py|pyc)$", path) != None:
            raise HTTPError(403)
        else:
            yield StaticFileHandler.get(self, path, include_body=include_body)


class CheckinOffice(GreetingPlace):
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


class CheckoutOffice(GreetingPlace):
    def get(self):
        self.clear_cookie("user_id")
        self.clear_cookie("device_id")
        self.clear_cookie("agent_auth")
        self.redirect(self.next_url)


class LobbyOffice(GreetingPlace):
    @coroutine
    @authenticated
    def get(self):
        self.render_list["count"] = yield self.get_count()
        self.render_list["origin_title"] = "大厅"
        self.management_render("lobby.htm")


class WorkingOffice(GreetingPlace):
    @coroutine
    @authenticated
    @slug_validation(["hash"])
    def get(self, method):
        self.render_list["method"] = method
        self.render_list["work"] = None
        if method == "new":
            self.render_list["origin_title"] = "进行创作"
        elif method == "edit":
            self.render_list["origin_title"] = "修改作品"
        else:
            raise HTTPError(404)
        self.render_list["page_title"] = (
            self.render_list["origin_title"] +
            " - " + self.config["site_name"] + "管理局" + "工作室")
        self.management_render("working.htm")


navigation = [
    (r"/", IndexPlace),
    # (r"/classes/(.*).htm", ClassesPlace),  This will be avaliable in futhre
    # (r"/timeline", HistoryLibrary),
    (r"/writings/(.*).htm", WritingsPlace),
    (r"/management/checkin", CheckinOffice),
    (r"/management/checkin/", RedirectHandler, {"url": "/management/checkin"}),
    (r"/management/checkout", CheckoutOffice),
    (r"/management/checkout/", RedirectHandler,
     {"url": "/management/checkout"}),
    (r"/management", RedirectHandler, {"url": "/management/lobby"}),
    (r"/management/", RedirectHandler, {"url": "/management/lobby"}),
    (r"/management/lobby", LobbyOffice),
    (r"/management/lobby/", RedirectHandler, {"url": "/management/lobby"}),
    (r"/management/working", RedirectHandler,
     {"url": "/management/working/new"}),
    (r"/management/working/", RedirectHandler,
     {"url": "/management/working/new"}),
    (r"/management/working/([a-zA-Z0-9]+)", WorkingOffice)
]

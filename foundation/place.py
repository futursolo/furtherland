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
from tornado.escape import *
import re
import misaka
import hashlib
import base64
import random
import string
import functools
import mako.lookup
import mako.template
import time
import datetime


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


class PlacesOfInterest(RequestHandler):
    current_user = None

    @coroutine
    def prepare(self):
        self.render_list = {}
        self.memories = self.settings["historial_records"]
        self.current_user = yield self.get_current_user()
        self.config = yield self.get_config()

        self.next_url = self.get_arg("next", arg_type="link", default="/")
        self.remote_ip = self.request.headers.get(
            "X-Forwarded-For", self.request.headers.get(
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
        elif arg_type == "slug":
            hash_value = str(value)
            if re.match(r"^([\-a-zA-Z0-9]+)$", hash_value) == None:
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

    def hash(self, target, method, b64=True):
        target = target.encode(encoding="utf-8")
        if b64:
            target = base64.b64encode(target)
        if method == "sha1":
            return hashlib.sha1(target).hexdigest()
        if method == "sha256":
            return hashlib.sha256(target).hexdigest()
        if method == "md5":
            return hashlib.md5(target).hexdigest()

    @coroutine
    def get_user(self, **kwargs):
        if not hasattr(self, "_user_list"):
            self._user_list = {}
        book = self.memories.select("Masters")
        condition = list(kwargs.keys())[0]
        if condition != "user_list":
            if condition not in list(self._user_list.keys()):
                self._user_list[condition] = {}
            value = kwargs[condition]
            if value not in list(self._user_list[condition].keys()):
                book.find({condition: value}).length(1)
                yield book.do()
                self._user_list[condition][value] = book.result()
        raise Return(self._user_list[condition][value])

    def get_random(self, length):
        return "".join(random.sample(string.ascii_letters + string.digits,
                                     length))

    def date_time(self, unix_time):
        timezone = self.config["timezone"]

    @coroutine
    def get_class(self):
        pass

    @coroutine
    def get_writing(self, only_published=True, **kwargs):
        book = self.memories.select("Writings")
        find_condition = {}
        if only_published is True:
            find_condition["publish"] = True
        if "class_id" in list(kwargs.keys()):
            if kwargs["class_id"] != 0:
                find_condition["class_id"] = kwargs["class_id"]
            book.find(find_condition)
            book.sort([["time", False]])
            book.length(0, force_dict=True)
        elif "slug" in list(kwargs.keys()):
            find_condition["slug"] = kwargs["slug"]
            book.find(find_condition)
        elif "id" in list(kwargs.keys()):
            find_condition["_id"] = kwargs["id"]
            book.find(find_condition)
        yield book.do()
        raise Return(book.result())

    @coroutine
    def get_page(self, only_published=True, **kwargs):
        book = self.memories.select("Pages")
        find_condition = {}
        if only_published is True:
            find_condition["publish"] = True
        if "class_id" in list(kwargs.keys()):
            if kwargs["class_id"] != 0:
                find_condition["class_id"] = kwargs["class_id"]
            book.find(find_condition)
            book.sort([["time", False]])
            book.length(0, force_dict=True)
        elif "slug" in list(kwargs.keys()):
            find_condition["slug"] = kwargs["slug"]
            book.find(find_condition)
        elif "id" in list(kwargs.keys()):
            find_condition["_id"] = kwargs["id"]
            book.find(find_condition)
        yield book.do()
        raise Return(book.result())

    @coroutine
    def get_reply(self, only_permitted=True, with_privacy=False, **kwargs):
        book = self.memories.select("Replies")
        ignore = None
        if not with_privacy:
            ignore = ["email", "ip"]
        find_condition = {}
        if only_permitted is True:
            find_condition["permit"] = True
        if "writing_id" in list(kwargs.keys()):
            if kwargs["writing_id"] != 0:
                find_condition["writing_id"] = kwargs["writing_id"]
            book.find(find_condition, ignore)
            book.sort([["time", True]])
            book.length(0, force_dict=True)
        elif "id" in list(kwargs.keys()):
            find_condition["_id"] = kwargs["id"]
            book.find(find_condition, ignore)
        yield book.do()
        raise Return(book.result())

    @coroutine
    def issue_id(self, working_type):
        book = self.memories.select("Counts")
        book.find_modify({"_id": working_type}, ["number"])
        yield book.do()
        raise Return(int(book.result()["number"]))

    def make_md(self, content, more=True):
        if not more:
            content = content.split("<!--more-->")[0]
        return misaka.html(content)

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
        if not kwargs.pop("__without_database", False):
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
                "public_url": self.public_url,
                "FurtherLand": self.settings["further_land"]
            }
        else:
            env_kwargs = {}
        env_kwargs.update(kwargs)
        self.xsrf_form_html()
        return template.render(**env_kwargs)

    def render(self, page, nutrition=True):
        if "page_title" not in list(self.render_list.keys()):
            self.render_list["page_title"] = (
                self.render_list["origin_title"] +
                " - " + self.config["site_name"])
        if nutrition:
            page = "nutrition/" + self.config["nutrition_type"] + "/" + page
        self.finish(self.render_string(page, **self.render_list))

    def public_url(self, path, include_host=None, **kwargs):
        pass

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
        raise Return(result)

    def escape(self, item, item_type="html"):
        if item_type == "html":
            return xhtml_escape(item)
        elif item_type == "url":
            return url_escape(item)
        else:
            raise HTTPError(500)

    def write_error(self, status_code, **kwargs):
        if self.settings.get("serve_traceback") and "exc_info" in kwargs:
            self.set_header("Content-Type", "text/plain")
            for line in traceback.format_exception(*kwargs["exc_info"]):
                self.write(line)
            self.finish()
        else:
            if status_code == 404:
                self.render_list["origin_title"] = "出错了！"
                self.render("404.htm")
            else:
                self.render_list["status_code"] = status_code
                self.render_list["error_message"] = self._reason
                self.finish(
                    self.render_string(
                        "management/error.htm",
                        __without_database=True,
                        **self.render_list))


class CentralSquare(PlacesOfInterest):
    @coroutine
    def get(self):
        self.render_list["contents"] = yield self.get_writing(class_id=0)
        for key in self.render_list["contents"]:
            self.render_list["contents"][key]["author"] = yield self.get_user(
                _id=self.render_list["contents"][key]["author"])
            self.render_list["contents"][key]["content"] = self.make_md(
                self.render_list["contents"][key]["content"], more=False)
        self.render_list["origin_title"] = "首页"
        self.render("index.htm")


class ConferenceHall(PlacesOfInterest):
    @coroutine
    @slug_validation(["slug"])
    def get(self, writing_slug):
        writing = yield self.get_writing(slug=writing_slug)
        if not writing:
            raise HTTPError(404)
        writing["author"] = yield self.get_user(_id=writing["author"])
        writing["content"] = self.make_md(writing["content"])
        self.render_list["writing"] = writing
        self.render_list["origin_title"] = writing["title"]
        self.render("writings.htm")


class MemorialWall(PlacesOfInterest):
    @coroutine
    @slug_validation(["slug"])
    def get(self, page_slug):
        page = yield self.get_page(slug=page_slug)
        if not page:
            raise HTTPError(404)
        page["author"] = yield self.get_user(_id=page["author"])
        page["content"] = self.make_md(page["content"])
        self.render_list["page"] = page
        self.render_list["origin_title"] = page["title"]
        self.render("pages.htm")


class HistoryLibrary(PlacesOfInterest):
    pass


class SpiritPlace(StaticFileHandler):
    @coroutine
    def get(self, path, include_body=True):
        if re.match(
         r"^(.*)\.(htm|json|tpl|csv|mo|po|py|pyc|pyx)$", path) is not None:
            raise HTTPError(403)
        else:
            yield StaticFileHandler.get(self, path, include_body=include_body)


class NotFoundHandler(PlacesOfInterest):
    def get(self, *args, **kwargs):
        raise HTTPError(404)

    post = get

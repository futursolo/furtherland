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
from tornado.httpclient import *
from collections import OrderedDict
from foundation.place import PlacesOfInterest, slug_validation, visitor_only
import json
import os
import time
import re


class PublicArea(PlacesOfInterest):
    @coroutine
    @authenticated
    def post(self):
        result = []
        public_path = os.path.join(
            os.path.join(
                self.settings["static_path"], "public"), "files")
        url_base = "/spirit/public/files"

        action = self.get_arg("action", arg_type="hash", default="list")

        if action == "list":
            book = self.memories.select("Publics")
            book.find({"type": "file"}).sort([["time", False]])
            book.length(0, force_dict=True)
            yield book.do()
            result = book.result()

        elif action == "put":
            if self.request.files:
                for f in self.request.files["files[]"]:
                    book = self.memories.select("Publics")
                    current_time = int(time.time())
                    current_path = os.path.join(public_path, str(
                        current_time))
                    current_url = os.path.join(url_base, str(
                        current_time))
                    if not os.path.exists(current_path):
                        os.makedirs(current_path)

                    filename = f["filename"]
                    current_file_path = os.path.join(
                        current_path, filename)
                    current_file_url = os.path.join(
                        current_url, filename)

                    with open(current_file_path, "wb") as file:
                        file.write(f["body"])

                    file_info = OrderedDict()
                    file_info["time"] = current_time
                    file_info["type"] = "file"
                    file_info["content_type"] = None
                    file_info["filename"] = filename
                    file_info["filepath"] = current_file_path
                    file_info["fileurl"] = current_file_url
                    file_info["email_md5"] = None
                    file_info["_id"] = yield self.issue_id("Publics")
                    result.append(file_info)
                    book.add(file_info)
                    yield book.do()
            else:
                raise HTTPError(500)
        else:
            raise HTTPError(500)
        self.finish(json.dumps(result))


class AvatarArea(PlacesOfInterest):
    @coroutine
    @slug_validation(["hash"])
    def get(self, slug):
        size = self.get_arg("s", default=80, arg_type="number")
        default = self.get_arg("d", default=404, arg_type="hash")
        current_time = int(time.time())

        path = self.settings["static_path"] + "/public/avatar/" + slug
        if not os.path.exists(path):
            os.makedirs(path)

        file_path = path + "/" + str(size)
        if os.path.exists(file_path):
            book = self.memories.select("Publics")
            book.find(
                {"filename": str(size), "email_md5": slug, "type": "avatar"})
            yield book.do()
            avatar_info = book.result()
            if not avatar_info:
                os.remove(file_path)
                book.erase(
                    {
                        "filename": str(size),
                        "email_md5": slug,
                        "type": "avatar"
                    }
                )
                yield book.do()
            elif (current_time - avatar_info["time"]) <= (15 * 24 * 60 * 60):
                self.set_header(
                    "content-type", avatar_info["content_type"])
                with open(file_path, "rb") as f:
                    self.finish(f.read())
                return
            else:
                os.remove(file_path)
                book.erase(
                    {
                        "filename": str(size),
                        "email_md5": slug,
                        "type": "avatar"
                    }
                )
                yield book.do()

        client = AsyncHTTPClient()
        link = (
            "https://secure.gravatar.com/avatar/" + slug + "?s=" +
            str(size) + "&d=" + str(default))
        response = yield client.fetch(link)
        if response.error:
            raise HTTPError(response.code)
        avatar = response.body
        content_type = response.headers.get("content-type")
        avatar_info = OrderedDict()
        avatar_info["time"] = current_time
        avatar_info["type"] = "avatar"
        avatar_info["content_type"] = content_type
        avatar_info["filename"] = str(size)
        avatar_info["filepath"] = file_path
        avatar_info["fileurl"] = None
        avatar_info["email_md5"] = slug
        avatar_info["_id"] = yield self.issue_id("Publics")

        with open(file_path, "wb") as f:
            f.write(avatar)

        book = self.memories.select("Publics")
        book.find(
            {"filename": str(size), "email_md5": slug, "type": "avatar"})
        yield book.do()
        if book.result():
            book.erase(
                {
                    "filename": str(size),
                    "email_md5": slug,
                    "type": "avatar"
                }
            )
            yield book.do()
        book.add(avatar_info)
        yield book.do()

        self.set_header("content-type", content_type)
        self.finish(avatar)


class ReplyArea(PlacesOfInterest):
    @coroutine
    def post(self):
        action = self.get_arg("action", arg_type="hash")
        writing_id = self.get_arg("writing", arg_type="number")
        reply_id = self.get_arg("reply", arg_type="number")
        if action == "get":
            method = self.get_arg("method", arg_type="hash")
            if method == "list" and writing_id:
                result = yield self.get_reply(writing_id=writing_id)
                for key in result:
                    result[key]["content"] = self.make_md(
                        result[key]["content"])
                    result[key]["_id"] = int(
                        result[key]["_id"])
            elif method == "single" and reply_id:
                result = yield self.get_reply(id=reply_id)
                result["content"] = self.make_md(result["content"])
                result["_id"] = int(result["_id"])
            else:
                raise HTTPError(500)
            self.finish(json.dumps(result))
        elif action == "new":
            reply = OrderedDict()
            reply["permit"] = True
            reply["writing_id"] = writing_id
            if self.current_user:
                reply["master"] = True
                reply["name"] = self.current_user["username"]
                reply["email"] = self.current_user["email"]
                reply["homepage"] = self.current_user["homepage"]
            elif self.current_visitor:
                reply["master"] = False
                reply["name"] = self.current_visitor["name"]
                reply["email"] = self.current_visitor["email"]
                reply["homepage"] = self.current_visitor["homepage"]
            else:
                raise HTTPError(403)
            reply["ip"] = self.remote_ip
            reply["time"] = int(time.time())
            reply["emailmd5"] = self.hash(reply["email"].lower(),
                                          "md5", b64=False)
            content = self.escape(self.get_arg("content", arg_type="origin"),
                                  item_type="html")
            content = re.sub(
                re.compile(r"(data:)", re.IGNORECASE), "data：", content)
            content = re.sub(
                re.compile(
                    r"(javascript:)", re.IGNORECASE), "javascript：", content)
            reply["content"] = content
            reply["_id"] = yield self.issue_id("Replies")
            book = self.memories.select("Replies")
            book.add(reply)
            result = {}
            try:
                yield book.do()
                result["success"] = True
                result["id"] = reply["_id"]
            except:
                result["success"] = False
                result["reason"] = "unkonwn"
            self.finish(json.dumps(result))
        elif action == "permit":
            if not self.current_user:
                raise HTTPError(500)
            reply_id = self.get_arg("reply", arg_type="number")
            permit = self.get_arg("permit", arg_type="boolean")
            if permit is None:
                raise HTTPError(500)
            book = self.memories.select("Replies")
            book.find({"_id": reply_id})
            yield book.do()
            reply = book.result()
            if not reply:
                raise HTTPError(404)
            if reply["permit"] == permit:
                self.finish(json.dumps({"status": True}))
                return
            book = self.memories.select("Replies")
            book.set({"_id": reply_id}, {"permit": permit})
            yield book.do()
            self.finish(json.dumps({"status": True}))
        elif action == "erase":
            if not self.current_user:
                raise HTTPError(500)
            reply_id = self.get_arg("reply", arg_type="number")
            book = self.memories.select("Replies")
            book.erase({"_id": reply_id})
            yield book.do()
            self.finish(json.dumps({"status": True}))
        else:
            raise HTTPError(500)


class ContentArea(PlacesOfInterest):
    @coroutine
    @authenticated
    def post(self):
        action = self.get_arg("action", arg_type="hash")
        content_type = self.get_arg("type", arg_type="hash")
        content_id = self.get_arg("content", arg_type="number")
        if action == "erase":
            if not self.current_user:
                raise HTTPError(500)
            reply_id = self.get_arg("reply", arg_type="number")
            if content_type == "writing":
                book = self.memories.select("Writings")
            elif content_type == "page":
                book = self.memories.select("Pages")
            book.erase({"_id": content_id})
            yield book.do()
            self.finish(json.dumps({"status": True}))
        else:
            raise HTTPError(500)


class PreviewArea(PlacesOfInterest):
    @coroutine
    @authenticated
    def post(self):
        content = self.get_arg("content", arg_type="origin", default="")
        self.finish(self.make_md(content))


class SlugVerifyArea(PlacesOfInterest):
    @coroutine
    @authenticated
    def post(self):
        slug = self.get_arg("slug", arg_type="slug")
        working_type = self.get_arg("type", arg_type="hash")
        working_id = self.get_arg("working", arg_type="number")
        if not(slug and working_type):
            raise HTTPError(500)
        if working_type == "writing":
            book = self.memories.select("Writings")
        elif working_type == "page":
            book = self.memories.select("Pages")
        book.find({"slug": slug})
        yield book.do()
        working = book.result()
        if working and (
         working_id is not False and working["_id"] != working_id):
            self.finish(json.dumps({"status": False}))
        else:
            self.finish(json.dumps({"status": True}))


class SelfKillArea(PlacesOfInterest):
    @authenticated
    def get(self):
        self.finish("ok!")
        self.furtherland.stage.communicate("exit")

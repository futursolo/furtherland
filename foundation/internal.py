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


class PublicArea(PlacesOfInterest):
    @coroutine
    @authenticated
    def post(self):
        public_path = os.path.join(self.settings["static_path"], "public")
        if self.request.files:
            for f in self.request.files["postfile"]:
                file_path = os.path.join(public_path, str(int(time.time())))
                if not os.path.exists(file_path):
                    os.makedirs(file_path)
                filename = f["filename"]
                with open("configs/basic.json", "w+") as f:
                    return json.loads(f.read().replace(r"\n", "").strip())


class AvatarArea(PlacesOfInterest):
    @coroutine
    @slug_validation(["hash"])
    def get(self, slug):
        size = self.get_arg("s", default=80, arg_type="number")
        default = self.get_arg("d", default=404, arg_type="hash")
        path = (self.settings["static_path"] + "/public/avatar/" + str(size) +
                "/" + slug)
        if os.path.exists(path):
            with open(path + "/information.json") as f:
                avatar_info = json.loads(f.read().replace(r"\n", "").strip())
            if (int(time.time()) - avatar_info["time"]) <= (15 * 24 * 60 * 60):
                self.set_header(
                    "content-type", avatar_info["content_type"])
                with open(path + "/content", "rb") as f:
                    self.finish(f.read())
                return
            else:
                os.removedirs(path)
                os.makedirs(path)
        else:
            os.makedirs(path)
        client = AsyncHTTPClient()
        link = (
            "https://secure.gravatar.com/avatar/" + slug + "?s=" +
            str(size) + "&d=" + str(default))
        response = yield client.fetch(link)
        if response.error:
            raise HTTPError(response.code)
        avatar = response.body
        content_type = response.headers.get("content-type")
        avatar_info = {}
        avatar_info["content_type"] = content_type
        avatar_info["time"] = int(time.time())
        with open(path + "/information.json", "w") as f:
            f.write(json.dumps(avatar_info))
        with open(path + "/content", "wb") as f:
            f.write(avatar)
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
            elif method == "single" and reply_id:
                result = yield self.get_reply(id=reply_id)
                result["content"] = self.make_md(result["content"])
            else:
                raise HTTPError(500)
            self.finish(json.dumps(result))
        elif action == "new":
            reply = OrderedDict()
            reply["writing_id"] = writing_id
            if not self.current_user:
                reply["master"] = False
                reply["name"] = self.get_arg("name", arg_type="origin")
                reply["email"] = self.get_arg("email", arg_type="mail_address")
                reply["homepage"] = self.get_arg("homepage", arg_type="link")
                if not (reply["name"] and reply["email"]):
                    result = {
                        "success": False,
                        "reason": "incomplation"
                    }
                    self.finish(json.dumps(result))
                    return
                reply["name"] = self.escape(reply["name"], item_type="html")
                reply["permit"] = False
            else:
                reply["master"] = True
                reply["name"] = self.current_user["username"]
                reply["email"] = self.current_user["email"]
                reply["homepage"] = self.current_user["homepage"]
                reply["permit"] = True
            reply["ip"] = self.remote_ip
            reply["time"] = int(time.time())
            reply["emailmd5"] = self.hash(reply["email"].lower(),
                                          "md5", b64=False)
            content = self.escape(self.get_arg("content", arg_type="origin"),
                                  item_type="html")
            reply["content"] = content
            reply["_id"] = yield self.issue_id("Replies")
            book = self.memories.select("Replies")
            book.add(reply)
            result = {}
            try:
                yield book.do()
                result["success"] = reply["master"]
                result["id"] = reply["_id"]
                if not reply["master"]:
                    result["reason"] = "waitforcheck"
            except:
                result["success"] = False
                result["reason"] = "unkonwn"
            self.finish(json.dumps(result))
        else:
            raise HTTPError(500)

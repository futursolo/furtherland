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
        client = AsyncHTTPClient()
        link = (
            "https://secure.gravatar.com/avatar/" + slug + "?s=" +
            str(self.get_arg("s", default=80, arg_type="number")) +
            "&d=" + str(self.get_arg("d", default=404, arg_type="number")))
        response = yield client.fetch(link)
        if response.error:
            raise HTTPError(response.code)
        avatar = response.body
        self.set_header("content-type", response.headers.get("content-type"))
        self.finish(avatar)


class ReplyArea(PlacesOfInterest):
    @coroutine
    def post(self):
        action = self.get_arg("action", arg_type="hash")
        writing_id = self.get_arg("writing", arg_type="number")
        reply_id = self.get_arg("reply", arg_type="number")
        if action == "get":
            if method == "list" and writing_id:
                result = yield self.get_reply(writing_id=writing_id)
                for key in result:
                    result[key]["emailmd5"] = self.hash(
                        result[key]["email"].lower(), "md5")
                    result[key]["email"] = None
            elif method == "single" and reply_id:
                result = yield self.get_reply(id=reply_id)
                result["emailmd5"] = self.hash(result["email"].lower(),
                                               "md5")
                result["email"] = None
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
                reply["permit"] = False
            else:
                reply["master"] = True
                reply["name"] = self.current_user["username"]
                reply["email"] = self.current_user["email"]
                reply["homepage"] = self.current_user["homepage"]
                reply["permit"] = True
            content = self.escape(self.get_arg("content", arg_type="origin"),
                                  item_type="html")
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
            self.finish(json.dumps(result))
        else:
            raise HTTPError(500)

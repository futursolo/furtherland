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
                                          "md5")
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

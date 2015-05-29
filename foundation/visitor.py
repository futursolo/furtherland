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
from tornado.auth import *
from foundation.place import PlacesOfInterest, slug_validation, visitor_only
from collections import OrderedDict

import tornado.httpclient
import tornado.curl_httpclient
import tornado.escape
import tornado.httputil
import json
import urllib.parse as urllib_parse
import functools
import traceback


def _auth_return_future(f):
    """Similar to tornado.concurrent.return_future, but uses the auth
    module's legacy callback interface.
    Note that when using this decorator the ``callback`` parameter
    inside the function will actually be a future.
    """
    replacer = ArgReplacer(f, 'callback')

    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        future = TracebackFuture()
        callback, args, kwargs = replacer.replace(future, args, kwargs)
        if callback is not None:
            future.add_done_callback(
                functools.partial(_auth_future_to_callback, callback))

        def handle_exception(typ, value, tb):
            if future.done():
                return False
            else:
                future.set_exc_info((typ, value, tb))
                return True
        with ExceptionStackContext(handle_exception):
            f(*args, **kwargs)
        return future
    return wrapper


class GitHubOAuth2Mixin(OAuth2Mixin):
    _OAUTH_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
    _OAUTH_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token"
    _API_URL = "https://api.github.com/user"
    _API_EMAILS_URL = "https://api.github.com/user/emails"
    _OAUTH_NO_CALLBACKS = False

    @coroutine
    def get_authenticated_user(self, redirect_uri, client_id, client_secret,
                               code):
        http = tornado.httpclient.AsyncHTTPClient()
        args = {
          "redirect_uri": redirect_uri,
          "code": code,
          "client_id": client_id,
          "client_secret": client_secret,
        }

        response = yield http.fetch(self._oauth_request_token_url(**args))

        args_requests = tornado.escape.parse_qs_bytes(
                tornado.escape.native_str(response.body))

        for key in args_requests.keys():
            args_requests[key] = args_requests[key][-1].decode()

        if "error" in args:
            raise Exception(args["error"])

        url = tornado.httputil.url_concat(self._API_URL, args_requests)
        http = tornado.curl_httpclient.CurlAsyncHTTPClient()
        response = yield http.fetch(url)

        try:
            user_info = tornado.escape.json_decode(response.body)
        except Exception:
            raise Exception("Error When Parsing User Information!")
        if isinstance(user_info, dict) and user_info.get("error_code"):
            raise Exception("Error When Parsing User Information!")
        if not user_info["email"]:
            http = tornado.curl_httpclient.CurlAsyncHTTPClient()
            url = tornado.httputil.url_concat(
                self._API_EMAILS_URL, args_requests)
            response = yield http.fetch(url)
            try:
                user_info["email"] = tornado.escape.json_decode(
                    response.body)[0]["email"]
            except Exception:
                raise Exception("Error When Parsing User Information!")
        result = {"access_token": args_requests["access_token"]}
        result.update(user_info)
        return result


class VisitorGitHubCheckinPlace(PlacesOfInterest, GitHubOAuth2Mixin):
    @coroutine
    def get(self):
        if self.get_arg("code", default=False, arg_type="hash"):
            try:
                visitor = yield self.get_authenticated_user(
                    redirect_uri="{0}/visitor/github".format(
                        self.config["site_url"]
                    ),
                    code=self.get_arg("code", arg_type="origin"),
                    client_id=self.config["github_client_id"],
                    client_secret=self.config["github_client_secret"])
            except Exception as e:
                self.write(e.args[0])
            result = yield self.checkin_visitor(oauth_type="github",
                                                visitor=visitor)
            self.set_scookie("visitor_id", result["visitor_id"])
            self.set_scookie("visitor_auth", result["visitor_auth"])
            next_url = self.get_scookie("oauth_next_url", default="/",
                                        arg_type="link")
            self.clear_cookie("oauth_next_url")
            self.redirect(next_url)
        else:
            self.set_scookie("oauth_next_url",
                             self.get_arg("next", arg_type="link"))
            yield self.authorize_redirect(
                redirect_uri="{0}/visitor/github".format(
                    self.config["site_url"]
                ),
                client_id=self.config["github_client_id"],
                scope=["user"],
                response_type="code")


class VisitorCheckoutOffice(PlacesOfInterest):
    def get(self):
        self.clear_cookie("visitor_id")
        self.clear_cookie("visitor_auth")
        self.redirect(self.next_url)

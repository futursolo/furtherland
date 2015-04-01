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


import tornado.web
import tornado.gen
import tornado.ioloop
import tornado.process
import tornado.netutil
import tornado.httpserver
import os

from . import path
from . import memory as historial


class FurtherLand:
    def __init__(self, melody):
        stage = tornado.web.Application(
            handlers=path.navigation,
            static_handler_class=path.SpiritPlace,

            cookie_secret=melody.secret,
            xsrf_cookies=True,
            root_path=os.path.split(os.path.realpath(melody.base))[0],
            static_path=os.path.join(
                os.path.split(os.path.realpath(melody.base))[0], "spirit"),
            template_path=os.path.join(
                os.path.split(os.path.realpath(melody.base))[0], "spirit"),

            login_url="/checkin",

            historial_records=historial.Records(melody.library),

            autoescape=None,
            debug=True,
            static_url_prefix="/spirit/",
            further_land=self
        )
        try:
            # Build Multi Land Enterance
            tornado.process.fork_processes(0, max_restarts=100)
        except:
            pass
        self.land = tornado.httpserver.HTTPServer(stage)
        self.land.add_sockets(tornado.netutil.bind_sockets(
            melody.listen_port, address=melody.listen_ip))

    def rise(self):
            tornado.ioloop.IOLoop.instance().start()

    def set(self):
        tornado.ioloop.IOLoop.instance().stop()

    def version(self):
        return "FurtherLand Development v20150330"

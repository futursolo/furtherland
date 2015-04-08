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
import tornado.ioloop
import tornado.process
import tornado.netutil
import tornado.httpserver
import os

from . import place
from . import office
from . import internal
from . import memory as historial


navigation = [
    (r"/", place.CentralSquare),
    # (r"/classes/(.*).htm", ClassesPlace),  This will be avaliable in futhre
    # (r"/timeline", HistoryLibrary),
    (r"/writings/([\-a-zA-Z0-9]+).htm", place.ConferenceHall),

    # Office Redirects
    (r"/management/checkin/", RedirectHandler, {"url": "/management/checkin"}),
    (r"/management/checkout/", RedirectHandler,
     {"url": "/management/checkout"}),
    (r"/management", RedirectHandler, {"url": "/management/lobby"}),
    (r"/management/", RedirectHandler, {"url": "/management/lobby"}),
    (r"/management/lobby/", RedirectHandler, {"url": "/management/lobby"}),
    (r"/management/working", RedirectHandler,
     {"url": "/management/working/new"}),
    (r"/management/working/", RedirectHandler,
     {"url": "/management/working/new"}),
    (r"/management/crda", RedirectHandler,
     {"url": "/management/crda/writings"}),
    (r"/management/crda/", RedirectHandler,
     {"url": "/management/crda/writings"}),
    (r"/management/configuration/", RedirectHandler,
     {"url": "/management/configuration"}),

    (r"/management/checkin", office.CheckinOffice),
    (r"/management/checkout", office.CheckoutOffice),
    (r"/management/lobby", office.LobbyOffice),
    (r"/management/working/([a-zA-Z0-9]+)", office.WorkingOffice),
    (r"/management/crda/([a-zA-Z0-9]+)", office.CRDAOffice),
    (r"/management/configuration", office.ControlOffice),

    (r"/channel/avatar/([a-zA-Z0-9]+)", internal.AvatarArea),
    (r"/channel/reply", internal.ReplyArea)
]


class FurtherLand:
    def __init__(self, melody):
        stage = Application(
            handlers=navigation,
            static_handler_class=place.SpiritPlace,

            cookie_secret=melody.secret,
            xsrf_cookies=True,
            root_path=os.path.split(os.path.realpath(melody.base))[0],
            static_path=os.path.join(
                os.path.split(os.path.realpath(melody.base))[0], "spirit"),
            template_path=os.path.join(
                os.path.split(os.path.realpath(melody.base))[0], "spirit"),

            login_url="/management/checkin",

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
        return "FurtherLand Sakihokori Edition"

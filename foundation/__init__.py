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
from . import memory as historial


navigation = [
    (r"/", place.CentralSquare),
    # (r"/classes/(.*).htm", ClassesPlace),  This will be avaliable in future
    # (r"/timeline", HistoryLibrary),
    (r"/feed.xml", place.NewsAnnouncement),
    (r"/api", place.TerminalService),
    (r"/avatar/(.*)", place.IllustratePlace),
    (r"/writings/(.*).htm", place.ConferenceHall),
    (r"/pages/(.*).htm", place.MemorialWall),

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
    (r"/management/api", office.ActionOffice),
    (r"/management/(.*)/(.*)", office.MainOffice),
    (r"/management/(.*)", office.MainOffice),

    (r"(.*)", place.LostAndFoundPlace)
]


class FurtherLand:
    def __init__(self, melody):
        import os
        self.identity = os.getpid()
        self.melody = melody
        # Build A Port
        self.port = tornado.netutil.bind_sockets(
            melody.listen_port, address=melody.listen_ip)
        self.stage = Application(
            handlers=navigation,

            cookie_secret=melody.secret,
            xsrf_cookies=True,
            root_path=os.path.split(os.path.realpath(melody.base))[0],
            static_path=os.path.join(
                os.path.split(os.path.realpath(melody.base))[0], "spirit"),
            template_path=os.path.join(
                os.path.split(os.path.realpath(melody.base))[0], "factory"),

            login_url="/management/checkin",

            historial_records=historial.Records(melody.library),

            autoescape=None,
            debug=melody.dev,
            static_url_prefix="/spirit/",
            further_land=self,
            safe_land=melody.safeland
        )
        try:
            # Build Multi Land Enterance
            tornado.process.fork_processes(
                tornado.process.cpu_count() * 2, max_restarts=100)
        except:
            pass

    def rise(self):
        try:
            print("FurtherLand has been risen on %s:%d." % (
                self.melody.listen_ip, self.melody.listen_port))
            import tornado.ioloop
            self.land = tornado.httpserver.HTTPServer(self.stage)
            self.land.add_sockets(self.port)
            tornado.ioloop.IOLoop.current().start()
        except:
            self.set()

    def set(self):
        tornado.ioloop.IOLoop.current().stop()
        print("FurtherLand set.")

    def version(self):
        return "FurtherLand Sakihokori Edition"

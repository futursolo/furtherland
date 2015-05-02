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
import mako

from . import place
from . import office
from . import internal
from . import memory as historial
from multiprocessing import Pipe
from multiprocessing.connection import Connection


navigation = [
    (r"/", place.CentralSquare),
    # (r"/classes/(.*).htm", ClassesPlace),  This will be avaliable in futhre
    # (r"/timeline", HistoryLibrary),
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
    (r"/management/lobby", office.LobbyOffice),
    (r"/management/working/(.*)", office.WorkingOffice),
    (r"/management/crda/(.*)", office.CRDAOffice),
    (r"/management/configuration", office.ControlOffice),
    (r"/management/rerise", office.ReriseOffice),

    (r"/channel/avatar/(.*)", internal.AvatarArea),
    (r"/channel/public", internal.PublicArea),
    (r"/channel/reply", internal.ReplyArea),
    (r"/channel/preview", internal.PreviewArea),
    (r"/channel/slug_verify", internal.SlugVerifyArea),
    (r"/channel/selfkill", internal.SelfKillArea),
    (r"/channel/content", internal.ContentArea),
    (r"(.*)", place.LostAndFoundPlace)
]


class Stage(Application):
    def __init__(self, *args, **kwargs):
        self._conn_main_recv, self._conn_main_send = Pipe()
        self.furtherland = kwargs["further_land"]
        Application.__init__(self, *args, **kwargs)

    def setup(self, ioloop):
        self._conn_child_recv, self._conn_child_send = Pipe()
        if not tornado.process.task_id():
            ioloop.add_handler(self._conn_main_recv.fileno(),
                               self._handle_child_event,
                               ioloop.READ)

    def communicate(self, data):
        self._conn_main_send.send((self._conn_child_send.fileno(), data))
        return self._conn_child_recv.recv()

    def _handle_child_event(self, fd, events):
        conn_fileno, data = self._conn_main_recv.recv()
        if data == "exit":
            print("FurtherLand will set in a short period.")
            import os
            import signal
            while True:
                os.killpg(
                    os.getpgid(self.furtherland.identity), signal.SIGKILL)
        Connection(conn_fileno).send("acknowledged")


class FurtherLand:
    def __init__(self, melody):
        import os
        self.identity = os.getpid()
        # Build A Port
        self.port = tornado.netutil.bind_sockets(
            melody.listen_port, address=melody.listen_ip)
        self.stage = Stage(
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
        self.factory_preload = {}
        self.config_preload = {}
        self.master_preload = {}
        self.factory = mako.lookup.TemplateLookup(
            [os.path.join(
                os.path.split(os.path.realpath(melody.base))[0], "factory")],
            input_encoding="utf-8",
            output_encoding="utf-8",
            default_filters=["decode.utf_8"]
        )

    def rise(self):
        import tornado.ioloop
        try:
            import asyncio
            tornado.ioloop.IOLoop.configure(
                "tornado.platform.asyncio.AsyncIOLoop")
            print("FurtherLand is Using Asyncio Event Loop.")
        except:
            pass
        self.land = tornado.httpserver.HTTPServer(self.stage)
        self.land.add_sockets(self.port)
        if hasattr(self.stage, "setup"):
            self.stage.setup(tornado.ioloop.IOLoop.current())
        tornado.ioloop.IOLoop.current().start()

    def set(self):
        tornado.ioloop.IOLoop.current().stop()

    def version(self):
        return "FurtherLand Sakihokori Edition"

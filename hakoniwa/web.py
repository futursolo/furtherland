#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
#   Copyright 2019 Kaede Hoshikawa
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

from typing import Dict, Any, Optional, Union, Pattern, Callable, Awaitable

from . import requests
# from . import responses
from . import impl_lambda
from . import handlers
from . import exceptions
from . import constants
from . import security

import destination
import sketchbook
import concurrent.futures
import asyncio
import asyncio.base_events
import datetime
import ssl

__all__ = ["Application"]


class Application:
    class DefaultHandler(handlers.RequestHandler):
        async def before(self) -> None:
            raise exceptions.HttpError(constants.HttpStatusCode.NOT_FOUND)

    def __init__(
        self, *, sketch_path: Optional[str] = None,
        skt_ctx: Optional[sketchbook.AsyncioSketchContext] = None,
        skt_executor: Optional[concurrent.futures.ThreadPoolExecutor] = None,

        csrf_protect: bool = False,
        static_path: Optional[str] = None,
        static_handler_path: Union[
            str, Pattern[str]] = r"^static/(?P<file>.*?)$",

        security_secret: Optional[
            Union[str, bytes, security.BaseSecurityContext]] = None,
        secure_cookie_max_age: datetime.timedelta =
        datetime.timedelta(days=30),
            safe_cookies: bool = True) -> None:
        self.handlers: destination.Dispatcher[handlers.BaseRequestHandler] = \
            destination.Dispatcher()

        if sketch_path is not None:
            if skt_ctx is None:
                loop = asyncio.get_event_loop()
                skt_ctx = sketchbook.AsyncioSketchContext(
                    cache_sketches=False if loop.get_debug() else True)

            self._skt_finder: Optional[sketchbook.AsyncSketchFinder] = \
                sketchbook.AsyncSketchFinder(
                sketch_path, executor=skt_executor, skt_ctx=skt_ctx)

        else:
            self._skt_finder = None

        self._csrf_protect = csrf_protect

        if static_path is not None:
            static_path_2 = static_path

            class StaticFileHandler(handlers.StaticFileHandler):
                static_path = static_path_2

            self.handlers.add(
                destination.ReRule(static_handler_path, StaticFileHandler),
                name="static")

        if security_secret is not None:
            if isinstance(security_secret, security.BaseSecurityContext):
                self._sec_ctx: Optional[security.BaseSecurityContext] = \
                    security_secret

            else:
                if isinstance(security_secret, str):
                    security_secret = security_secret.encode("utf-8")

                self._sec_ctx = \
                    security.HmacSha256SecurityContext(security_secret)

        else:
            self._sec_ctx = None

        self._secure_cookie_max_age = secure_cookie_max_age
        self._safe_cookies = safe_cookies

    async def process_request(self, request: requests.Request) -> None:
        try:
            resolved_path = self.handlers.resolve(request.path)
            handler: handlers.BaseRequestHandler = resolved_path.identifier(
                self, request, resolved_path.kwargs)

        except destination.NoMatchesFound:
            handler = self.DefaultHandler(self, request, {})

        await handler._process_request()

    async def process_lambda_request(
            self, event: Dict[str, Any]) -> Dict[str, Any]:
        request = impl_lambda.LambdaRequest(event)
        await self.process_request(request)

        response = await request._get_final_response()
        return response.translate()

    def make_server(self) -> Callable[[], asyncio.Protocol]:
        raise NotImplementedError

    def listen(
        self, port: int, address: str = "localhost",
        tls_ctx: Optional[Union[bool, ssl.SSLContext]] = None
    ) -> Awaitable[asyncio.base_events.Server]:
        """
        Make a server and listen to the specified port and address.

        :arg port: port number to bind
        :arg address: ip address or hostname to bind
        :arg tls_ctx: TLS Context or True for default tls context None or False
        to disable tls
        """
        if tls_ctx:
            if isinstance(tls_ctx, bool):
                _context: Optional[ssl.SSLContext] = \
                    ssl.create_default_context()

            else:
                _context = tls_ctx

        else:
            _context = None

        loop = asyncio.get_event_loop()

        f = loop.create_server(
            self.make_server(), address, port, ssl=_context)

        return loop.create_task(f)  # type: ignore

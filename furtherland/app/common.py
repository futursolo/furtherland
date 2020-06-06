#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
#   Copyright 2020 Kaede Hoshikawa
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

from __future__ import annotations
from typing import Dict, Any

import hakoniwa
import datetime
import asyncio

# Workaround to make sure autopep8 would leave it alone.
try:
    from .. import env

    # Check all envs.
    _env_store = env.EnvStore.get()

except ImportError:
    raise

else:
    from .. import backend  # noqa: F401
    from .. import resources

__all__ = ["FurtherLand", "BaseRequestHandler"]

_meta = backend.BackendMeta.get()

_init_lock = asyncio.Lock()


class FurtherLand:
    def __init__(self) -> None:
        self.app = hakoniwa.Application(
            sketch_path=resources.get_sketch_root(),
            csrf_protect=True,
            static_path=resources.get_asset_root(),
            static_handler_path=r"^assets/(?P<file>.*?)$",

            security_secret=_env_store.secret.get(),
            secure_cookie_max_age=datetime.timedelta(days=180),
            safe_cookies=True
        )

        self._inited = False

    async def init(self) -> None:
        async with _init_lock:
            if self._inited:
                return

            asyncio.get_event_loop().set_debug(_env_store.debug.get())

            await _meta.init()

            self._inited = True

    @staticmethod
    def get() -> FurtherLand:
        return _land

    async def before(self) -> None:
        await self.init()

    async def process_lambda_request(
            self, event: Dict[str, Any]) -> Dict[str, Any]:
        await self.before()

        result = await self.app.process_lambda_request(event)

        # Disconnect Database to prevent MySQL Database has gone away error.
        await _meta.disconnect()

        return result


_land = FurtherLand()


class BaseRequestHandler(hakoniwa.RequestHandler):
    @property
    def land(self) -> FurtherLand:
        return _land

    async def infer_base_url(self) -> str:
        return "https://preview.futures.moe"

    async def get_sketch_args(self) -> Dict[str, Any]:
        args = await super().get_sketch_args()

        args["land_base_url"] = await self.infer_base_url()


class FaviconHandler(hakoniwa.StaticFileHandler):
    static_path = resources.get_asset_root()

    async def get(self, **kwargs: str) -> None:
        await self.handle_static_file(file_uri_path="images/favicon.ico")


_land.app.handlers.add(hakoniwa.ReRule(r"^favicon.ico$", FaviconHandler))


class RobotsTxtHandler(hakoniwa.StaticFileHandler):
    static_path = resources.get_asset_root()

    async def get(self, **kwargs: str) -> None:
        await self.handle_static_file(file_uri_path="robots.txt")


_land.app.handlers.add(hakoniwa.ReRule(r"^robots.txt$", RobotsTxtHandler))

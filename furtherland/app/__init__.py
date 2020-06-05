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

from ..utils import flatten_async

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

__all__ = ["Furtherland"]


class Furtherland:
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

    @staticmethod
    def get() -> Furtherland:
        return land

    async def process_lambda_request(
            self, event: Dict[str, Any]) -> Dict[str, Any]:
        result = await land.process_lambda_request(event)

        # Disconnect Database to prevent MySQL Database has gone away error.
        await backend.meta.disconnect()

        return result


land = Furtherland()


@flatten_async
async def process_lambda_request(
        event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    return await land.process_lambda_request(event)

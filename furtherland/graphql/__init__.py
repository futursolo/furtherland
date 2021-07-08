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

from typing import Any, Dict, Optional
import pathlib

import tartiflette

_GRAPHQL_DIR = pathlib.Path(__file__).parent

_ENGINE: Optional[tartiflette.Engine] = None


async def error_handler(
    exception: Exception, error: Dict[str, Any]
) -> Dict[str, Any]:
    raise NotImplementedError


async def get_engine() -> tartiflette.Engine:
    global _ENGINE

    if not _ENGINE:
        _ENGINE = await tartiflette.create_engine(
            sdl=[str(_GRAPHQL_DIR)],
            error_coercer=error_handler,  # type: ignore
            modules=["furtherland.graphql.resolvers"],
        )

    return _ENGINE

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
from typing import Union, Optional, Tuple, Any, Dict, ClassVar

from ..common import BaseRequestHandler

from hakoniwa.utils import Json

import json
import hakoniwa
import traceback


class ApiError(hakoniwa.HttpError):
    default_status_code: ClassVar[Union[int, hakoniwa.HttpStatusCode]] = \
        hakoniwa.HttpStatusCode.INTERNAL_SERVER_ERROR

    @property
    def reason(self) -> Optional[Tuple[int, str]]:
        return None

    def __init__(
        self,
        status_code: Optional[Union[int, hakoniwa.HttpStatusCode]] = None,
            *args: Any, **kwargs: Any) -> None:
        super().__init__(
            status_code or self.default_status_code, *args, **kwargs)


class RestRequestHandler(BaseRequestHandler):
    async def write_json(self, __json: Json) -> None:
        self.set_header("content-type", "application/json")
        await self.write(json.dumps(__json))

    async def write_error(
        self,
        status_code: Optional[Union[int, hakoniwa.HttpStatusCode]] = None,
        e: Optional[Exception] = None,
            message: Optional[str] = None) -> None:
        if isinstance(e, ApiError):
            await self.failed(e)

        else:
            await self.failed(ApiError(status_code or 500))

        if e:
            traceback.print_exception(e.__class__, e, e.__traceback__)

    async def ok(
        self, __content: Optional[Json] = None, *,
        status_code: Optional[
            Union[int, hakoniwa.HttpStatusCode]] = None) -> None:

        if status_code is None:
            if __content is not None:
                status_code = hakoniwa.HttpStatusCode.NO_CONTENT

            else:
                status_code = hakoniwa.HttpStatusCode.OK

        status_code = hakoniwa.HttpStatusCode(status_code)

        await self.write_json({
            "ok": True,
            "status": {
                "code": int(status_code),
                "description": status_code.phrase
            },
            "content": __content
        })

    async def failed(self, __e: ApiError) -> None:
        j: Dict[str, Json] = {
            "ok": False,
            "status": {
                "code": int(__e.status_code),
                "description": str(__e.status_code.phrase)
            },
        }

        if __e.reason is not None:
            j["reason"] = {
                "code": __e.reason[0],
                "description": __e.reason[1]
            }

        await self.write_json(j)

    async def after(self) -> None:
        if not self._body_buf:
            raise ApiError(404)

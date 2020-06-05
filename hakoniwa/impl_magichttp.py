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

from typing import Optional, Mapping

from . import constants
from . import requests
from . import responses

import magichttp
import magicdict
import asyncio
import typing
import weakref

if typing.TYPE_CHECKING:
    from . import web


class MagichttpServerProtocol(magichttp.HttpServerProtocol):  # type: ignore
    def __init__(self, __app: "web.Application") -> None:
        self._keep_reading: Optional["asyncio.Task[None]"] = None
        self._app = __app
        self._loop = asyncio.get_event_loop()

    async def _read_forever(self) -> None:
        tasks: "weakref.WeakSet[asyncio.Task[None]]" = weakref.WeakSet()
        try:
            async for reader in self:
                request = MagicHttpRequest(reader)

                tasks.add(
                    self._loop.create_task(self._app.process_request(request)))

        except asyncio.CancelledError:
            raise

        finally:
            await asyncio.wait(list(tasks), return_when=asyncio.ALL_COMPLETED)

    def connection_made(self, transport: asyncio.Transport) -> None:
        super().connection_made(transport)

        self._keep_reading = self._loop.create_task(
            self._read_forever())

    def connection_lost(self, exc: Optional[BaseException]) -> None:
        super().connection_lost(exc)

        if self._keep_reading:
            self._keep_reading.cancel()
            self._keep_reading = None


class MagicHttpRequest(requests.ReadableRequest):
    """
    Reader is not detachable yet.
    Detaching is prepared for http upgrade.
    """

    def __init__(self, __reader: magichttp.HttpRequestReader) -> None:
        self._reader = __reader
        self._initial = self._reader.initial
        self._body: Optional[bytes] = None

    @property
    def method(self) -> constants.HttpRequestMethod:
        return self._initial.method

    @property
    def version(self) -> constants.HttpVersion:
        return self._initial.version

    @property
    def uri(self) -> str:
        return self._initial.uri  # type: ignore

    @property
    def authority(self) -> str:
        return self._initial.authority  # type: ignore

    @property
    def scheme(self) -> constants.HttpScheme:
        return constants.HttpScheme(self._initial.scheme)

    @property
    def headers(self) -> magicdict.FrozenTolerantMagicDict[str, str]:
        return self._initial.headers

    @property
    def body(self) -> Optional[bytes]:
        return self._body

    async def read(self) -> bytes:
        """
        May raise :code:`MaxBufferLengthReachedError`. Use .reader whenever
        possible.
        """
        if self._body is None:
            self._body = await self._reader.read()

        return self._body

    async def write_response(
        self, status_code: constants.HttpStatusCode, *,
        headers: Optional[Mapping[str, str]] = None
    ) -> "MagicHttpResponse":
        writer = await self._reader.write_response(status_code, headers)
        return MagicHttpResponse(writer, self)

    @property
    def reader(self) -> magichttp.HttpRequestReader:
        return self._reader

    def detach_reader(self) -> magichttp.HttpRequestReader:
        raise NotImplementedError


class MagicHttpResponse(responses.WritableResponse):
    def __init__(
        self, __writer: magichttp.HttpResponseWriter,
            __request: MagicHttpRequest) -> None:
        self._writer = __writer
        self._initial = self._writer.initial
        self._request = __request

    @property
    def request(self) -> MagicHttpRequest:
        return self._request

    @property
    def status_code(self) -> constants.HttpStatusCode:
        self._initial.status_code

    @property
    def version(self) -> constants.HttpVersion:
        return self._initial.version

    @property
    def headers(self) -> magicdict.FrozenTolerantMagicDict[str, str]:
        return self._initial.headers

    async def write(self, data: bytes) -> None:
        self._writer.write(data)

    async def finish(self) -> None:
        self._writer.finish()
        await self._writer.wait_finished()

    def finished(self) -> bool:
        return self._writer.finished()  # type: ignore

    async def wait_finished(self) -> None:
        await self._writer.wait_finished()

    @property
    def writer(self) -> magichttp.HttpResponseWriter:
        return self._writer

    async def flush(self) -> None:
        await self._writer.flush()

    def abort(self) -> None:
        self._writer.abort()

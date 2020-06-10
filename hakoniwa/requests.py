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
from .utils import lazy_property

from . import constants
from . import httputils

import magicdict
import abc
import magichttp
import typing
import urllib.parse

if typing.TYPE_CHECKING:
    from . import responses

__all__ = ["Request", "ReadableRequest"]


class Request(abc.ABC):
    @property
    @abc.abstractmethod
    def method(self) -> constants.HttpRequestMethod:
        raise NotImplementedError

    @property
    @abc.abstractmethod
    def version(self) -> constants.HttpVersion:
        raise NotImplementedError

    @property
    @abc.abstractmethod
    def uri(self) -> str:
        raise NotImplementedError

    @lazy_property
    def _parsed_uri(self) -> urllib.parse.ParseResult:
        return urllib.parse.urlparse(self.uri)

    @lazy_property
    def path(self) -> str:
        return self._parsed_uri.path

    @lazy_property
    def queries(self) -> magicdict.FrozenTolerantMagicDict[str, str]:
        return magicdict.FrozenTolerantMagicDict(
            urllib.parse.parse_qsl(self._parsed_uri.query))

    @property
    @abc.abstractmethod
    def authority(self) -> str:
        raise NotImplementedError

    @property
    @abc.abstractmethod
    def scheme(self) -> constants.HttpScheme:
        raise NotImplementedError

    @property
    @abc.abstractmethod
    def headers(self) -> magicdict.FrozenTolerantMagicDict[str, str]:
        raise NotImplementedError

    @lazy_property
    def cookies(self) -> "httputils.HttpCookies[str]":
        cookies: "httputils.HttpCookies[str]" = httputils.HttpCookies()
        if "cookie" in self.headers.keys():
            for cookie_header in self.headers.get_list("cookie"):
                cookies.load(cookie_header)
        return cookies

    @property
    def body(self) -> Optional[bytes]:
        return None

    @abc.abstractmethod
    async def read(self) -> bytes:
        raise NotImplementedError

    @abc.abstractmethod
    async def write_response(
        self, status_code: constants.HttpStatusCode, *,
        headers: Optional[Mapping[str, str]] = None
    ) -> "responses.Response":
        raise NotImplementedError

    def __repr__(self) -> str:  # pragma: no cover
        parts = [
            f"method={self.method!r}",
            f"version={self.version!r}",
            f"uri={self.uri!r}"]

        try:
            parts.append(f"authority={self.authority!r}")

        except AttributeError:
            pass

        try:
            parts.append(f"scheme={self.scheme!r}")

        except AttributeError:
            pass

        parts.append(f"headers={self.headers!r}")

        return f"<{self.__class__.__name__} {', '.join(parts)}>"

    def __str__(self) -> str:  # pragma: no cover
        return repr(self)


class ReadableRequest(Request):
    @property
    def reader(self) -> magichttp.HttpRequestReader:
        raise NotImplementedError

    def detach_reader(self) -> magichttp.HttpRequestReader:
        raise NotImplementedError

    async def write_response(
        self, status_code: constants.HttpStatusCode, *,
        headers: Optional[Mapping[str, str]] = None
    ) -> "responses.WritableResponse":
        raise NotImplementedError

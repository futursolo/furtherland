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

from . import constants
from . import requests

import abc
import magichttp
import magicdict

__all__ = ["Response", "WritableResponse"]


class Response(abc.ABC):
    @property
    @abc.abstractmethod
    def request(self) -> requests.Request:
        raise NotImplementedError

    @property
    @abc.abstractmethod
    def status_code(self) -> constants.HttpStatusCode:
        raise NotImplementedError

    @property
    @abc.abstractmethod
    def version(self) -> constants.HttpVersion:
        raise NotImplementedError

    @property
    @abc.abstractmethod
    def headers(self) -> magicdict.FrozenTolerantMagicDict[str, str]:
        raise NotImplementedError

    @abc.abstractmethod
    async def write(self, data: bytes) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def finish(self) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    def finished(self) -> bool:
        raise NotImplementedError

    @abc.abstractmethod
    async def wait_finished(self) -> None:
        raise NotImplementedError

    def __repr__(self) -> str:  # pragma: no cover
        parts = [
            f"request={self.request!r}",
            f"status_code={self.status_code!r}",
            f"version={self.version!r}",
            f"headers={self.headers!r}"]

        return f"<{self.__class__.__name__} {', '.join(parts)}>"

    def __str__(self) -> str:  # pragma: no cover
        return repr(self)


class WritableResponse(Response):
    @property
    @abc.abstractmethod
    def writer(self) -> magichttp.HttpResponseWriter:
        raise NotImplementedError

    @abc.abstractmethod
    async def flush(self) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    def abort(self) -> None:
        raise NotImplementedError

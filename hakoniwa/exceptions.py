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

from typing import Union, Any

from . import constants

__all__ = ["HttpError", "InvalidStateError"]


class HttpError(Exception):
    """
    raise an HTTP Error.

    .. code-block:: python3

      async def get(self, *args, **kwargs):
          raise HTTPError(500, "Please contact system administrator.")
    """
    def __init__(
        self, status_code: Union[
                int, constants.HttpStatusCode
        ] = constants.HttpStatusCode.INTERNAL_SERVER_ERROR,
            *args: Any, **kwargs: Any) -> None:
        if isinstance(status_code, int):
            self.status_code = constants.HttpStatusCode(status_code)

        else:
            self.status_code = status_code

        super().__init__(*args, **kwargs)  # type: ignore

    @property
    def _err_str(self) -> str:
        return super().__str__()

    def __repr__(self) -> str:
        return "HTTPError" + repr((self.status_code, ) + self.args)

    def __str__(self) -> str:
        if self._err_str:
            return f"HTTP {int(self.status_code)}: {self._err_str}"

        else:
            return f"HTTP {int(self.status_code)}: {self.status_code.phrase}"


class InvalidStateError(HttpError):
    pass

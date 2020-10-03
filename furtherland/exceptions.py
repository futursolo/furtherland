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

from typing import ClassVar, Union, Optional, Tuple, Any

import hakoniwa


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


class OutOfScope(ApiError):
    default_status_code = hakoniwa.HttpStatusCode.FORBIDDEN
    reason = (
        1601696780,
        "Token is not authorised with scope required for this request.")


class MethodNotAllowed(ApiError):
    default_status_code = hakoniwa.HttpStatusCode.METHOD_NOT_ALLOWED
    reason = (1601710747, "Method is not allowed for requested resource.")


class NoSuchResident(ApiError):
    default_status_code = hakoniwa.HttpStatusCode.NOT_FOUND
    reason = (1601696112, "No such resident.")

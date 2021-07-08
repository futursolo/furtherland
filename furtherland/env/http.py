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

from .common import BaseEnvStore, BoolEnv, IntEnv, StrEnv

__all__ = ["HttpEnvStore"]


class HttpEnvStore(BaseEnvStore):
    _prefix = "HTTP_"

    address = StrEnv("ADDRESS", "The address to bind.", default="localhost")

    port = IntEnv("PORT", "The port to bind.", default=1741)

    base_url = StrEnv(
        "BASE_URL",
        [
            "The Base URL of the site.",
            "This can usually be inferred. "
            "But if you are using a reverse proxy,",
            "It is strongly recommended that you set this URL.",
        ],
    )

    assume_tls = BoolEnv(
        "ASSUME_TLS",
        [
            "Assume TLS Connection even if it is not.",
            "Useful when running behind a reverse proxy.",
            "Has no effect when TLS is enabled.",
        ],
        default=False,
    )

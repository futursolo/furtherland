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

from typing import Optional

__all__ = ["HttpConfig"]


class HttpConfig:
    def __init__(
            self, listen_port: int, *, listen_address: str = "localhost",
            assume_tls: bool = False) -> None:
        self.port: int = listen_port

        self.address = listen_address

        # Assume TLS Connection even if it is not.
        # Useful when running behind a reverse proxy.
        # Has no effect when TLS is enabled.
        self.assume_tls = assume_tls

    @classmethod
    def from_env(cls) -> "HttpConfig":
        raise NotImplementedError

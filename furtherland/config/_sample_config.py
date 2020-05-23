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

from typing import Union

from furtherland.config import BaseConfig, BackendConfig, BackendType, \
    HttpConfig

from furtherland import furtherland


class Config(BaseConfig):
    # Backend Config
    backend = BackendConfig(BackendType.SqLite, "example.db")

    # Security Secret
    # This can be either string or bytes.
    # If it is a string, Furtherland will encode it with
    # :code:`secret.encode("utf-8")`.
    # If you don't have one you can get one by running :code:`os.urandom(32)`.
    secret: Union[str, bytes] = "__TOP_SECRET_PLEASE_TREAT_IT_LIKE_PASSWORD__"

    # Debug Mode
    debug = True

    http = HttpConfig(1741)


config = Config()
land = Furtherland(config)

if __name__ == "__main__":
    pass

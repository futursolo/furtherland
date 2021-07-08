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

import os

import dotenv

from .backend import BackendEnvStore
from .common import BaseEnvStore, BoolEnv, StrEnv
from .http import HttpEnvStore

# Try to load ENV_FILE before everything else.
_ENV_FILE = StrEnv("LAND_ENV_FILE")

try:
    env_file_path = _ENV_FILE.get()

    dotenv.load_dotenv(dotenv_path=env_file_path)

except KeyError:
    pass


class SecretEnv(StrEnv):
    def _get_env_file_default(self) -> str:
        return f'"{os.urandom(32).hex()}"'


class EnvStore(BaseEnvStore):
    _prefix = "LAND_"

    Backend = BackendEnvStore
    Http = HttpEnvStore

    secret = SecretEnv(
        "SECRET",
        [
            "Changing this secret will invalidate all cookies.",
            "This can be any valid utf-8 string",
            "If you don't have one you can get one by "
            "running :code:`os.urandom(32).hex()`.",
        ],
        display_name="Security Secret",
        required=True,
    )

    debug = BoolEnv(
        "DEBUG",
        [
            "Set this to 1 enables the debug mode.",
            "Please set to False during production.",
        ],
        display_name="Debug Mode Switch",
        default=False,
    )

    use_kms = BoolEnv(
        "USE_KMS",
        [
            "Set this to 1 enables AWS KMS.",
            "All variables prefixed by `SEC_` will be decrypted by " "KMS.",
            "For example: `LAND_SECRET` will not be decrypted by KMS.",
            "             However, `SEC_LAND_SECRET` will be "
            "decrypted by KMS.",
            "This variable has no effect if boto3 is not installed.",
        ],
        display_name="Enable Amazon Key Management Service",
        default=False,
    )

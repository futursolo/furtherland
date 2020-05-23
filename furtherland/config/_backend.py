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

import enum
import certifi

__all__ = ["BackendType", "BackendConfig"]


class BackendType(enum.Enum):
    SqLite = ("sqlite://", 0)
    MySql = ("mysql+async://", 3306)
    PgSql = ("pgsql+async://", 5432)


class BackendConfig:
    def __init__(
        self, __type: BackendType, db_name: str, *,
        host: str = "localhost", port: Optional[int] = None,
        prefix: str = "furtherland_", user: Optional[str] = None,
            password: Optional[str] = None) -> None:
        self._type: BackendType = __type

        self._db_name = db_name

        self.host: str = host
        self.port: int = port or self._type.value[1]

        self.prefix: str = prefix

        self.user: Optional[str] = user
        self.__password: Optional[str] = password

        # TLS Config
        self.use_tls = False
        self.ca_path = certifi.where()

        # Client Certificate will be added in a future release.
        # self.client_cert_path: Optional[str] = None
        # self.client_key_path: Optional[str] = None

    @property
    def password(self) -> str:
        raise AttributeError("You cannot read password from BackendConfig.")

    @password.setter
    def password(self, value: str) -> None:
        self.__password = value

    @classmethod
    def from_db_url(cls, db_url: str) -> "BackendConfig":
        """
        scheme://username:password@host:port/database
        sqlite:///path/to/sqlite.db
        """
        raise NotImplementedError

    @classmethod
    def from_env(cls) -> "BackendConfig":
        raise NotImplementedError

    def _to_db_url(self) -> str:
        if self._type == BackendType.SqLite:
            return f"{self._type.value[0]}{self.host}"

        if self.user:
            cred = f"{self.user}:{self.__password}@"

        else:
            cred = ""

        return (f"{self._type.value[0]}{cred}{self.host}:{self.port}/"
                f"{self._db_name}")

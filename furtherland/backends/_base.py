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

from typing import Dict, Union, Optional

from ..utils import lazy_property, FurtherlandError

import peewee
import peewee_async
import playhouse.db_url
import certifi
import enum


class NotInitialised(FurtherlandError):
    """
    Error raised when trying to access certain properties before backend
    is properly initialised.
    """
    pass


class BackendType(enum.Enum):
    SqLite = ("sqlite://", 0)
    MySql = ("mysql+async://", 3306)
    PgSql = ("pgsql+async://", 5432)


class BackendConfig:
    def __init__(
        self, __type: BackendType, host: str, *,
        port: Optional[int] = None, prefix: str = "furtherland_",
        user: Optional[str] = None,
            password: Optional[str] = None) -> None:
        self._type: BackendType = __type

        self.host: str = host
        self.port: int = port or self._type.value[1]

        self.prefix: str = prefix

        self.user: Optional[str] = user
        self.__password: Optional[str] = password

        # TLS Config
        self.use_tls = False
        self.ca_path = certifi.where()

        self.client_cert_path: Optional[str] = None
        self.client_key_path: Optional[str] = None

    @property
    def password(self) -> str:
        raise AttributeError("You cannot read password from BackendConfig.")

    @password.setter
    def password(self, value: str) -> None:
        self.__password = value

    @classmethod
    def from_db_url(cls, db_url: str) -> "BackendConfig":
        raise NotImplementedError


class BackendMeta:
    def __init__(self) -> None:
        self._db: peewee.DatabaseProxy = peewee.DatabaseProxy()

        self._options: Optional[BackendConfig] = None

        self._initialised = False

        self.__url = ""

    @property
    def db(self) -> peewee.DatabaseProxy:
        return self._db

    @property
    def options(self) -> BackendConfig:
        if not self._options:
            raise NotInitialised("The backend has yet to be initialised.")

        return self._options

    @property
    def prefix(self) -> str:
        return self.options.prefix

    @lazy_property
    def mgr(self) -> peewee_async.Manager:
        return peewee_async.Manager(self.db)

    async def init(self, url: str, use_tls: Union[bool, str] = True) -> None:
        self.__url = url
        _ssl_params: Dict[str, Union[str, Dict[str, str]]] = {}

        if use_tls:
            if isinstance(use_tls, str):
                ca_path = use_tls

            else:
                ca_path = certifi.where()

            if url.startswith(("postgres", "pgsql")):
                _ssl_params["sslrootcert"] = ca_path
                _ssl_params["sslmode"] = "verify-full"

            elif url.startswith("mysql"):
                _ssl_params["ssl"] = {"ca": ca_path}

            elif url.startswith("sqlite"):
                pass  # No ssl for sqlite.

            else:
                raise ValueError("Unknown Database Scheme.")

        self._db.initialize(playhouse.db_url.connect(url, **_ssl_params))
        self._initialised = True

    def initialised(self) -> bool:
        return self._initialised

    async def disconnect(self) -> None:
        self.db.close()

        if not self.__url.startswith("sqlite"):
            await self.mgr.close()


__all__ = ["BackendConfig", "BackendMeta", "BackendType"]


meta = BackendMeta()

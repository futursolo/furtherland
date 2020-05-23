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

from __future__ import annotations
from typing import Dict, Union, Optional

from peewee import Model

from ..utils import lazy_property, FurtherlandError
from ..config import BackendConfig, BackendType

import peewee
import peewee_async
import playhouse.db_url
import threading
import string


class NotInitialised(FurtherlandError):
    """
    Error raised when trying to access certain properties before backend
    is properly initialised.
    """
    pass


class BackendMeta:
    def __init__(self) -> None:
        self._db: peewee.DatabaseProxy = peewee.DatabaseProxy()

        self._config: Optional[BackendConfig] = None

    @property
    def db(self) -> peewee.DatabaseProxy:
        return self._db

    @property
    def prefix(self) -> str:
        if not self._config:
            raise NotInitialised("The backend has yet to be initialised.")

        return self._config.prefix

    @lazy_property
    def mgr(self) -> Optional[peewee_async.Manager]:
        if not self._config:
            raise NotInitialised("The backend has yet to be initialised.")

        if self._config._type == BackendType.SqLite:
            return None

        return peewee_async.Manager(self.db)

    async def init(self, _config: BackendConfig) -> None:
        _ssl_params: Dict[str, Union[str, Dict[str, str]]] = {}

        if _config.use_tls:
            if _config._type == BackendType.PgSql:
                _ssl_params["sslrootcert"] = _config.ca_path
                _ssl_params["sslmode"] = "verify-full"

            elif _config._type == BackendType.MySql:
                _ssl_params["ssl"] = {"ca": _config.ca_path}

            elif _config._type == BackendType.SqLite:
                pass  # SQLite does not support TLS.

            else:
                raise ValueError("Unknown Database Scheme.")

        self._db.initialize(
            playhouse.db_url.connect(_config._to_db_url(), **_ssl_params))
        self._config = _config

    def initialised(self) -> bool:
        return self._config is not None

    async def disconnect(self) -> None:
        self.db.close()

        if self.mgr:
            await self.mgr.close()


meta = BackendMeta()

_CACHED_NAMES: Dict[str, str] = {}
_CACHE_LOCK = threading.Lock()


class BaseModel(Model):  # type: ignore
    """
    Base Database Model.
    """
    class Meta:
        database = meta.db

        def table_function(cls) -> str:
            """
            :code:`class Resident:...` -> :code:`furtherland_residents`
            """
            cls_name: str = cls.__name__  # type: ignore

            with _CACHE_LOCK:
                if cls_name not in _CACHED_NAMES:
                    changable_part = cls_name[1:]

                    fragments = [cls_name[0].lower()]

                    for s in changable_part:
                        if s in string.ascii_uppercase:
                            fragments.append("_" + s.lower())

                        else:
                            fragments.append(s)

                    fragments.append("s")
                    _CACHED_NAMES[cls_name] = meta.prefix + "".join(fragments)

                return _CACHED_NAMES[cls_name]

        @lazy_property
        def mgr(cls) -> Optional[peewee_async.Manager]:
            return meta.mgr

    @staticmethod
    async def seed_table() -> None:
        pass


__all__ = ["BaseModel", "meta", "BackendMeta", "NotInitialised"]

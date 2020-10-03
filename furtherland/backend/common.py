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
from typing import Dict, Union, AsyncIterator, TypeVar, Type, List

from peewee import Model

from ..utils import lazy_property
from ..env import BackendEnvStore

import peewee
import peewee_async
import playhouse.db_url
import string
import contextlib


_backend_envs = BackendEnvStore.get()

_TModelCls = TypeVar("_TModelCls", bound=Type["BaseModel"])


class BackendMeta:
    def __init__(self) -> None:
        self._db: peewee.DatabaseProxy = peewee.DatabaseProxy()
        self._initialised = False

        self._models: List[Type[BaseModel]] = []

    @property
    def db(self) -> peewee.DatabaseProxy:
        return self._db

    @lazy_property
    def mgr(self) -> peewee_async.Manager:
        return peewee_async.Manager(self.db)

    @contextlib.asynccontextmanager
    async def lock(self, skip_locking: bool = False) -> AsyncIterator[None]:
        if skip_locking:
            yield

        else:
            async with self.mgr.atomic():
                yield

    async def init(self) -> None:
        if self.initialised():
            return

        _ssl_params: Dict[str, Union[str, Dict[str, str]]] = {}
        db_url = _backend_envs.url.get()

        if _backend_envs.use_tls.get():
            if db_url.startswith(("pgsql", "postgres")):
                _ssl_params["sslrootcert"] = _backend_envs.ca_path.get()
                _ssl_params["sslmode"] = "verify-full"

            elif db_url.startswith("mysql"):
                _ssl_params["ssl"] = {"ca": _backend_envs.ca_path.get()}

            else:
                pass  # SQLite does not support TLS.

        self._db.initialize(
            playhouse.db_url.connect(db_url, **_ssl_params))

        for t in self._models:
            if t.__name__ in ("Resident", "ResidentOption", "Option"):
                t.create_table()

        self._initialised = True

    def initialised(self) -> bool:
        return self._initialised

    async def disconnect(self) -> None:
        self.db.close()

        await self.mgr.close()

    @staticmethod
    def get() -> BackendMeta:
        return _meta

    def add_model(self, m: _TModelCls) -> _TModelCls:
        if self.initialised():
            raise RuntimeError(
                "You cannot add more models after the meta is initialised.")

        self._models.append(m)

        return m


_meta = BackendMeta()

_CACHED_NAMES: Dict[str, str] = {}


class BaseModel(Model):  # type: ignore
    """
    Base Database Model.
    """
    class Meta:
        database = _meta.db

        def table_function(cls) -> str:
            """
            :code:`class ResidentOption:...` ->
            :code:`furtherland_resident_options`
            """
            cls_name: str = cls.__name__  # type: ignore

            if cls_name not in _CACHED_NAMES:
                changable_part = cls_name[1:]

                fragments = [
                    BackendEnvStore.get().table_prefix.get(),
                    cls_name[0].lower()
                ]

                for s in changable_part:
                    if s in string.ascii_uppercase:
                        fragments.append("_" + s.lower())

                    else:
                        fragments.append(s)

                if cls_name.endswith("ss"):  # for names like: classes
                    fragments.append("es")

                elif cls_name.endswith("y"):  # for names like: replies
                    fragments.pop(-1)
                    fragments.append("ies")

                else:
                    fragments.append("s")

                _CACHED_NAMES[cls_name] = "".join(fragments)

            return _CACHED_NAMES[cls_name]

    @staticmethod
    def mgr() -> peewee_async.Manager:
        return _meta.mgr

    @staticmethod
    async def seed_table() -> None:
        pass


__all__ = ["BaseModel", "BackendMeta"]

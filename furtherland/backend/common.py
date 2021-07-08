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

from typing import Any, Type, TypeVar
import functools
import string
import typing

from tortoise import Tortoise
from tortoise.models import Model

from ..env import BackendEnvStore

"""
Backend (Dababase) Model Definiation
"""

_TBaseModel = TypeVar("_TBaseModel", bound="Type[BaseModel]")


class Backend:
    """Backend Connection Manager"""

    def __init__(self) -> None:
        self._inited = False

    async def init(self) -> None:
        if not self._inited:
            await Tortoise.init(
                db_url="sqlite://db.sqlite3",
                # TODO: SSL
                modules={"models": ["furtherland.backend"]},
                use_tz=True,
            )
            self._inited = True

    async def __aenter__(self) -> Backend:
        await self.init()
        return self

    async def __aexit__(self, *exc: Any) -> None:
        await Tortoise.close_connections()

    @staticmethod
    def add_model(cls: _TBaseModel) -> _TBaseModel:
        @functools.wraps(cls)
        @BaseModel.with_name
        class MyModel(cls):  # type: ignore
            pass

        return typing.cast(_TBaseModel, MyModel)

    @staticmethod
    @functools.cache
    def get() -> Backend:
        return Backend()


@functools.cache
def get_table_name(cls_name: str) -> str:
    """
    :code:`class ResidentOption:...` ->
    :code:`furtherland_resident_options`
    """

    # Don't put underscore for first character.
    changable_part = cls_name[1:]

    # Prefix
    fragments = [BackendEnvStore.get().table_prefix.get(), cls_name[0].lower()]

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

    return "".join(fragments)


class BaseModel(Model):
    class Meta:
        abstract = True

    @staticmethod
    def with_name(cls: _TBaseModel) -> _TBaseModel:
        """
        :code:`class ResidentOption:...` ->
        :code:`furtherland_resident_options`
        """
        cls_name: str = cls.__name__

        cls._meta.db_table = get_table_name(cls_name)
        return cls


__all__ = ["BaseModel", "Backend"]

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

from typing import Union, TypeVar, Type, Any, Optional, Dict, List

from peewee import CharField, TextField, BigIntegerField, FloatField, \
    Check
from ..utils import FurtherlandError
from .common import BaseModel, meta

import typing


__all__ = ["NoSuchOption", "OptionTypeError", "Option"]


class NoSuchOption(KeyError, FurtherlandError):
    """
    No option with such name.
    """
    pass


class OptionTypeError(TypeError, FurtherlandError):
    """
    Option is found but with another type.
    """
    pass


_TOption = TypeVar("_TOption", bound="BaseOption")


class BaseOption(BaseModel):
    str_value = TextField()
    int_value = BigIntegerField()
    float_value = FloatField()

    _ident_fields: List[str] = []

    class Meta:
        constraints = [Check(
            "( CASE WHEN str_value IS NULL THEN 0 ELSE 1 END "
            "+ CASE WHEN int_value IS NULL THEN 0 ELSE 1 END "
            "+ CASE WHEN float_value IS NULL THEN 0 ELSE 1 END"
            ") = 1")]

    def _as_raw_value(self) -> Union[str, int, float]:
        if self.str_value is not None:
            return typing.cast(str, self.str_value)

        elif self.int_value is not None:
            return typing.cast(int, self.int_value)

        elif self.float_value is not None:
            return typing.cast(float, self.float_value)

        else:
            raise ValueError("Unknown Option Type.")

    def as_str(self) -> str:
        val = self._as_raw_value()

        if not isinstance(val, str):
            raise OptionTypeError(
                f"expected Option {self.name} to be a string, "
                f"found `{type(val)}`.")

        return val

    def as_int(self) -> int:
        val = self._as_raw_value()

        if not isinstance(val, int):
            raise OptionTypeError(
                f"expected Option {self.name} to be an integer, "
                f"found `{type(val)}`.")

        return val

    def as_float(self) -> float:
        val = self._as_raw_value()

        if not isinstance(val, float):
            raise OptionTypeError(
                f"expected Option {self.name} to be a floating-point number, "
                f"found `{type(val)}`.")

        return val

    @classmethod
    async def get_option(
        cls: Type[_TOption], name: str, *,
        default: Optional[Union[int, str, float]] = None,
        **kwargs: Any
    ) -> _TOption:
        try:
            if default is None:
                return typing.cast(
                    _TOption, await meta.mgr.get(cls, name=name))

        except cls.DoesNotExist as e:
            raise NoSuchOption(name) from e

        defaults: Dict[str, Union[str, int, float]] = {}

        if isinstance(default, str):
            defaults["str_value"] = default

        elif isinstance(default, int):
            defaults["int_value"] = default

        elif isinstance(default, float):
            defaults["float_value"] = default

        else:
            raise OptionTypeError(f"{type(default)} is not a valid type.")

        if list(kwargs.keys()) != cls._ident_fields:
            raise OptionTypeError(
                "The following identity fields are required: "
                f"{cls._ident_fields}")

        opt, _ = await meta.mgr.get_or_create(
            cls, defaults=defaults, name=name, **kwargs)
        return typing.cast(_TOption, opt)

    async def _del_option(self, **kwargs: Any) -> None:
        if list(kwargs.keys()) != self._ident_fields:
            raise OptionTypeError(
                "The following identity fields are required: "
                f"{self._ident_fields}")

        del_count = await meta.mgr.execute(
            self.delete().where(name=self.name, **kwargs))

        if del_count < 1:
            raise NoSuchOption(self.name)

    async def update_str(self, value: str) -> None:
        self.as_str()
        self.str_value = value

        await meta.mgr.update(self, only=("str_value",))

    async def update_int(self, value: int) -> None:
        self.as_int()
        self.int_value = value

        await meta.mgr.update(self, only=("int_value",))

    async def update_float(self, value: float) -> None:
        self.as_float()
        self.float_value = value

        await meta.mgr.update(self, only=("float_value",))

    async def inc_int(self: _TOption, step: int) -> _TOption:
        self.as_int()
        idents = {(k, getattr(self, k)) for k in self._ident_fields}
        await meta.mgr.execute(
            self.update(int_value=self.int_value + step)
            .where(name=self.name, **idents))

        return typing.cast(
            _TOption, await meta.mgr.get(self, name=self.name, **idents))

    async def inc_float(self: _TOption, step: float) -> _TOption:
        self.as_float()
        idents = {(k, getattr(self, k)) for k in self._ident_fields}
        await meta.mgr.execute(
            self.update(float_value=self.float_value + step)
            .where(name=self.name, **idents))

        return typing.cast(
            _TOption, await meta.mgr.get(self, name=self.name, **idents))


class Option(BaseOption):
    """
    Furtherland Global Options.

    If you wish to associate options with a certain Resident, Writing, Page,
    and/or Comment, please use their corresponding options.

    Available Types:
        - :code:`str`
        - :code:`int`
        - :code:`float`

    Typing works by setting corresponding
    :code:`OptionType` as :code:`int` to :code:`_type` field

    Deleting an option is highly unrecommended. And thus the method is prefixed
    with underscore.

    This is the low-level api. You may want to use
    :module:`furtherland.options`.
    """
    name = CharField(null=False, index=True, unique=True, max_length=254)

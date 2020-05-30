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

from __futures__ import annotations  # noqa: F401
from typing import Union, Tuple, TypeVar, Type, Any, Optional, Dict, List

from peewee import CharField, TextField, BigIntegerField, FloatField, \
    IntegerField
from ..utils import FurtherlandError
from .common import BaseModel, meta

import enum
import typing


__all__ = ["NoSuchOption", "OptionTypeError",
           "OptionCorruptedError", "OptionType", "Option"]


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


class OptionCorruptedError(ValueError, FurtherlandError):
    """
    Option is found with correct type. But the value is null.
    """


@enum.unique
class OptionType(enum.IntEnum):
    String = 0
    Integer = 1
    FloatPoint = 2

    @classmethod
    def infer_type(cls, val: Any) -> OptionType:  # noqa: F821
        if isinstance(val, str):
            return cls.String

        elif isinstance(val, int):
            return cls.Integer

        elif isinstance(val, float):
            return cls.FloatPoint

        else:
            raise OptionTypeError(f"{type(val)} is not a valid type.")


_TOption = TypeVar("_TOption", bound="BaseOption")


class BaseOption(BaseModel):
    # type is a built-in function.
    _type = IntegerField(null=False)

    str_value = TextField()
    int_value = BigIntegerField()
    float_value = FloatField()

    _ident_fields: List[str] = []

    def _as_raw_value(self) -> \
            Tuple[OptionType, Union[str, int, float]]:
        try:
            opt_type = OptionType(self._type)

        except ValueError as e:
            raise OptionCorruptedError(
                f"Value {self._type} is not a valid type.") from e

        if opt_type == OptionType.String:
            if self.str_value is None:
                raise OptionCorruptedError(
                    f"Option `{self.name}` is string type, "
                    "but the value is `None`.")

            return opt_type, typing.cast(str, self.str_value)

        elif opt_type == OptionType.Integer:
            if self.int_value is None:
                raise OptionCorruptedError(
                    f"Option `{self.name}` is int type, "
                    "but the value is `None`.")

            return opt_type, typing.cast(int, self.int_value)

        elif opt_type == OptionType.FloatPoint:
            if self.float_value is None:
                raise OptionCorruptedError(
                    f"Option `{self.name}` is float type, "
                    "but the value is `None`.")

            return opt_type, typing.cast(float, self.float_value)

        else:
            raise ValueError("Unknown Option Type.")

    def as_str(self) -> str:
        opt_type, val = self._as_raw_value()

        if opt_type != OptionType.String:
            raise OptionTypeError(
                f"expected Option {self.name} to be `{OptionType.String}`, "
                f"found `{opt_type}`.")

        assert isinstance(val, str)
        return val

    def as_int(self) -> int:
        opt_type, val = self._as_raw_value()

        if opt_type != OptionType.Integer:
            raise OptionTypeError(
                f"expected Option {self.name} to be `{OptionType.Integer}`, "
                f"found `{opt_type}`.")

        assert isinstance(val, int)
        return val

    def as_float(self) -> float:
        opt_type, val = self._as_raw_value()

        if opt_type != OptionType.FloatPoint:
            raise OptionTypeError(
                f"expected Option {self.name} to be "
                f"`{OptionType.FloatPoint}`, found `{opt_type}`.")

        assert isinstance(val, float)
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

            opt_type = OptionType.infer_type(default)

            defaults: Dict[str, Union[str, int, float]] = {
                "_type": opt_type,
            }

            if opt_type == OptionType.String:
                defaults["str_value"] = default

            elif opt_type == OptionType.Integer:
                defaults["int_value"] = default

            else:  # OptionType.FloatPoint
                defaults["float_value"] = default

            if list(kwargs.keys()) != cls._ident_fields:
                raise OptionTypeError(
                    "The following identity fields are required: "
                    f"{cls._ident_fields}")

            opt, _ = await meta.mgr.get_or_create(
                cls, defaults=defaults, name=name, **kwargs)
            return typing.cast(_TOption, opt)

        except cls.DoesNotExist as e:
            raise NoSuchOption(name) from e

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
        - :code:`str` or :code:`OptionType.String`
        - :code:`int` or :code:`OptionType.Integer`
        - :code:`float` or :code:`OptionType.FloatPoint`

    Typing works by setting corresponding
    :code:`OptionType` as :code:`int` to :code:`_type` field

    Deleting an option is highly unrecommended. And thus the method is prefixed
    with underscore.
    """
    name = CharField(null=False, index=True, unique=True, max_length=254)

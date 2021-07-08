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

from typing import Any, Dict, List, Optional, Set, Type, TypeVar, Union
import abc
import typing

from tortoise import fields
from tortoise.exceptions import DoesNotExist
from tortoise.expressions import F
from tortoise.fields import data as d_fields

from ..utils import FurtherlandError
from .common import Backend, BaseModel

__all__ = ["NoSuchOption", "OptionTypeError", "BaseOption", "Option"]


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
    """
    The base class of options
    """

    str_value = d_fields.TextField()
    int_value = d_fields.BigIntField()
    float_value = d_fields.FloatField()

    _ident_fields: Set[str] = set()

    class Meta:
        """
        constraints = [
            Check(
                "( CASE WHEN str_value IS NULL THEN 0 ELSE 1 END "
                "+ CASE WHEN int_value IS NULL THEN 0 ELSE 1 END "
                "+ CASE WHEN float_value IS NULL THEN 0 ELSE 1 END"
                ") = 1"
            )
        ]
        """

        abstract = True

    def _as_raw_value(self) -> Union[str, int, float]:
        if self.str_value is not None:
            return typing.cast(str, self.str_value)

        elif self.int_value is not None:
            return typing.cast(int, self.int_value)

        elif self.float_value is not None:
            return typing.cast(float, self.float_value)

        else:
            raise ValueError("Unknown Option Type.")

    @property
    @abc.abstractmethod
    def name(self) -> str:
        raise NotImplementedError

    def as_str(self) -> str:
        val = self._as_raw_value()

        if not isinstance(val, str):
            raise OptionTypeError(
                f"expected Option {self.name} to be a string, "
                f"found `{type(val)}`."
            )

        return val

    def as_int(self) -> int:
        val = self._as_raw_value()

        if not isinstance(val, int):
            raise OptionTypeError(
                f"expected Option {self.name} to be an integer, "
                f"found `{type(val)}`."
            )

        return val

    def as_float(self) -> float:
        val = self._as_raw_value()

        if not isinstance(val, float):
            raise OptionTypeError(
                f"expected Option {self.name} to be a floating-point number, "
                f"found `{type(val)}`."
            )

        return val

    @classmethod
    async def get_option(
        cls: Type[_TOption],
        name: str,
        *,
        default: Optional[Union[int, str, float]] = None,
        **kwargs: Any,
    ) -> _TOption:

        try:
            if default is None:
                return await cls.get(name=name)

        except DoesNotExist as e:
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

        if set(kwargs.keys()) <= cls._ident_fields:
            raise OptionTypeError(
                "The following identity fields are required: "
                f"{cls._ident_fields}"
            )

        opt, _ = await cls.get_or_create(
            defaults=defaults, name=name, **kwargs
        )
        return opt

    """
    async def del_option(self, **kwargs: Any) -> None:
        if set(kwargs.keys()) <= self._ident_fields:
            raise OptionTypeError(
                "The following identity fields are required: "
                f"{self._ident_fields}"
            )

        del_count = await self.meta.mgr.execute(
            self.delete().where(name=self.name, **kwargs)
        )

        if del_count < 1:
            raise NoSuchOption(self.name)
    """

    async def update_str(self, value: str) -> None:
        self.as_str()

        self.update_from_dict({"str_value": value})

        await self.save(update_fields=["str_value"], force_update=True)

    async def update_int(self, value: int) -> None:
        self.as_int()

        self.update_from_dict({"int_value": value})

        await self.save(update_fields=["int_value"], force_update=True)

    async def update_float(self, value: float) -> None:
        self.as_float()

        self.update_from_dict({"float_value": value})

        await self.save(update_fields=["float_value"], force_update=True)

    async def inc_int(self, step: int) -> None:
        self.as_int()

        self.update_from_dict({"int_value": F("int_value") + step})

        await self.save(update_fields=["int_value"], force_update=True)

    """
    async def inc_float(self: _TOption, step: float) -> _TOption:
        self.as_float()
        idents = {(k, getattr(self, k)) for k in self._ident_fields}
        await self.meta.mgr.execute(
            self.update(float_value=self.float_value + step).where(
                name=self.name, **idents
            )
        )

        return typing.cast(
            _TOption, await self.meta.mgr.get(self, name=self.name, **idents)
        )
    """


@Backend.add_model
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

    name = d_fields.CharField(
        null=False, index=True, unique=True, max_length=254
    )

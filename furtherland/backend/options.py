#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
#   Copyright 2018 Kaede Hoshikawa
#
#   All rights reserved.

from __futures__ import annotations  # noqa: F401
from typing import Union, Tuple, TypeVar, Type, Any, Optional, Dict

from peewee import CharField, TextField, BigIntegerField, FloatField, \
    IntegerField
from ..utils import FurtherlandError
from .common import BaseModel, meta

import enum
import typing


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


class OptionType(enum.Enum):
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


_TOption = TypeVar("_TOption", bound="Option")


class Option(BaseModel):
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

    # type is a built-in function.
    _type = IntegerField(null=False)

    str_value = TextField()
    int_value = BigIntegerField()
    float_value = FloatField()

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
    async def get_obj(
        cls: Type[_TOption], name: str, *,
        upsert_default_value: Optional[Union[int, str, float]] = None
    ) -> _TOption:
        try:
            if upsert_default_value is None:
                opt: _TOption = await meta.mgr.get(cls, name=name)

            else:
                opt_type = OptionType.infer_type(upsert_default_value)

                defaults: Dict[str, Any] = {
                    "_type": opt_type.value,
                }

                if opt_type == OptionType.String:
                    defaults["str_value"] = upsert_default_value

                elif opt_type == OptionType.Integer:
                    defaults["int_value"] = upsert_default_value

                else:  # OptionType.FloatPoint
                    defaults["float_value"] = upsert_default_value

                opt, _ = await meta.mgr.get_or_create(
                    cls, defaults=defaults, name=name)

        except cls.DoesNotExist as e:
            raise NoSuchOption(name) from e

        return opt

    @classmethod
    async def _del_obj(cls, name: str) -> None:
        del_count = await meta.mgr.execute(cls.delete().where(name=name))

        if del_count < 1:
            raise NoSuchOption(name)

    @classmethod
    async def get_str(cls, name: str, *, default: Optional[str] = None,
                      upsert_default: bool = False) -> str:
        if upsert_default:
            assert default is not None, "You cannot upsert None as default."

            upsert_default_value: Optional[Union[str, int, float]] = default

        else:
            upsert_default_value = None

        opt: Option = await cls.get_obj(
            name, upsert_default_value=upsert_default_value)

        return opt.as_str()

    @classmethod
    async def get_int(cls, name: str, *, default: Optional[int] = None,
                      upsert_default: bool = False) -> int:
        if upsert_default:
            assert default is not None, "You cannot upsert None as default."

            upsert_default_value: Optional[Union[str, int, float]] = default

        else:
            upsert_default_value = None

        opt: Option = await cls.get_obj(
            name, upsert_default_value=upsert_default_value)
        return opt.as_int()

    @classmethod
    async def get_float(cls, name: str, *, default: Optional[int] = None,
                        upsert_default: bool = False) -> float:
        if upsert_default:
            assert default is not None, "You cannot upsert None as default."

            upsert_default_value: Optional[Union[str, int, float]] = default

        else:
            upsert_default_value = None

        opt: Option = await cls.get_obj(
            name, upsert_default_value=upsert_default_value)
        return opt.as_float()

    @classmethod
    async def set_str(
        cls, name: str, value: str, *, upsert: bool = True,
            skip_locking: bool = False) -> None:
        async with meta.lock(skip_locking):
            opt = await cls.get_obj(
                name, upsert_default_value=value if upsert else None)

            opt.as_str()  # check type
            opt.str_value = value
            await meta.mgr.update(opt, only=["str_value"])

    @classmethod
    async def set_int(
            cls, name: str, value: int, *, upsert: bool = True,
            skip_locking: bool = False) -> None:
        async with meta.lock(skip_locking):
            opt = await cls.get_obj(
                name, upsert_default_value=value if upsert else None)

            opt.as_int()  # check type
            opt.int_value = value
            await meta.mgr.update(opt, only=["int_value"])

    @classmethod
    async def inc_int(
        cls, name: str, step: int, *,
        default_value: int = 0, upsert: bool = True,
            skip_locking: bool = False) -> int:
        async with meta.lock(skip_locking):
            opt: Option
            created: bool
            if upsert:
                opt, created = await meta.mgr.create_or_get(
                    cls, name=name, _type=OptionType.Integer.value,
                    int_value=default_value + step)

                if created:
                    return opt.as_int()

            else:
                try:
                    opt = await meta.mgr.get(cls, name=name)
                    opt.as_int()  # check type

                except cls.DoesNotExist as e:
                    if not upsert:
                        raise NoSuchOption(name) from e

            await meta.mgr.execute(
                cls.update(int_value=cls.int_value + step)
                .where(name=name))

            opt = await meta.mgr.get(cls, name=name)
            return opt.as_int()

    @classmethod
    async def set_float(
        cls, name: str, value: float, *, upsert: bool = True,
            skip_locking: bool = False) -> None:
        async with meta.lock(skip_locking):
            opt = await cls.get_obj(
                name, upsert_default_value=value if upsert else None)

            opt.as_float()  # check type
            opt.float_value = value
            await meta.mgr.update(opt, only=["float_value"])

    @classmethod
    async def inc_float(
        cls, name: str, step: float, *,
        default_value: float = 0, upsert: bool = True,
            skip_locking: bool = False) -> float:
        async with meta.lock(skip_locking):
            opt: Option
            created: bool
            if upsert:
                opt, created = await meta.mgr.create_or_get(
                    cls, name=name, _type=OptionType.FloatPoint.value,
                    float_value=default_value + step)

                if created:
                    return opt.as_float()

            else:
                try:
                    opt = await meta.mgr.get(cls, name=name)
                    opt.as_float()  # check type

                except cls.DoesNotExist as e:
                    if not upsert:
                        raise NoSuchOption(name) from e

            await meta.mgr.execute(
                cls.update(float_value=cls.float_value + step)
                .where(name=name))

            opt = await meta.mgr.get(cls, name=name)
            return opt.as_float()

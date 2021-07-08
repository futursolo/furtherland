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

from typing import Any, Dict, Generic, Optional, Type, TypeVar, Union
import abc
import functools

from .backend import BaseModel as _BaseModel
from .backend import BaseOption as _BaseOption
from .backend import Option as _Option
from .utils import lazy_property

__all__ = ["BaseOption", "StrOption", "IntOption", "FloatOption"]


_T = TypeVar("_T", bound=Union[int, str, float])


class BaseOption(Generic[_T]):
    model_cls: Type[_BaseOption] = _Option
    prefix = "core_"

    def __init__(self, name: str) -> None:
        self.name = name

    @property
    def _full_name(self) -> str:
        return self.prefix + self.name

    def set_prefix(self, new_prefix: str) -> None:
        self.prefix = new_prefix

    @classmethod
    def ident_fields(cls) -> Dict[str, Any]:
        return {}

    async def _get(self, default: Optional[_T] = None) -> _BaseOption:
        return await _Option.get_option(
            self._full_name, default=default, **self.ident_fields()
        )

    @abc.abstractmethod
    async def get(self, default: Optional[_T] = None) -> _T:
        raise NotImplementedError

    @abc.abstractmethod
    async def set(self, value: _T) -> None:
        raise NotImplementedError

    async def inc(self, step: _T, default: _T) -> _T:
        raise NotImplementedError


class StrOption(BaseOption[str]):
    async def get(self, default: Optional[str] = None) -> str:
        return (await self._get(default=default)).as_str()

    async def set(self, value: str) -> None:
        opt = await self._get(default=value)
        await opt.update_str(value)


class IntOption(BaseOption[int]):
    async def get(self, default: Optional[int] = None) -> int:
        return (await self._get(default=default)).as_int()

    async def set(self, value: int) -> None:
        opt = await self._get(default=value)
        await opt.update_int(value)

    async def inc(self, step: int, default: int = 0) -> int:
        opt = await self._get(default=default)
        await opt.inc_int(step)

        return opt.as_int()


class FloatOption(BaseOption[float]):
    async def get(self, default: Optional[float] = None) -> float:
        return (await self._get(default=default)).as_float()

    async def set(self, value: float) -> None:
        opt = await self._get(default=value)
        await opt.update_float(value)


class OptionMixIn(abc.ABC):
    @property
    @abc.abstractmethod
    def model_cls(self) -> Type[_BaseModel]:
        raise NotImplementedError

    @classmethod
    def ident_fields(cls) -> Dict[str, _BaseModel]:
        raise NotImplementedError


class WithOption(abc.ABC):
    @property
    @abc.abstractmethod
    def _model(self) -> _BaseModel:
        raise NotImplementedError

    @lazy_property
    def _OptionMixIn(self) -> Type[OptionMixIn]:
        raise NotImplementedError

    @lazy_property
    def StrOption(self) -> Type[StrOption]:
        class _StrOption(StrOption, self._OptionMixIn):  # type: ignore
            pass

        return _StrOption

    @lazy_property
    def IntOption(self) -> Type[IntOption]:
        class _IntOption(IntOption, self._OptionMixIn):  # type: ignore
            pass

        return _IntOption

    @lazy_property
    def FloatOption(self) -> Type[FloatOption]:
        class _FloatOption(FloatOption, self._OptionMixIn):  # type: ignore
            pass

        return _FloatOption

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
from typing import Type, Dict

from .exceptions import NoSuchResident
from .utils import lazy_property

from .backend import BaseModel as _BaseModel, Resident as _Resident, \
    ResidentOption as _ResidentOption

from . import options
from . import visits

__all__ = ["Resident"]


class Resident(options.WithOption):
    def __init__(self) -> None:
        raise NotImplementedError

    @property
    def resident_id(self) -> int:
        raise NotImplementedError

    @property
    def _model(self) -> _Resident:
        raise NotImplementedError

    @lazy_property
    def _OptionMixIn(self) -> Type[options.OptionMixIn]:
        class _OptionMixIn(options.OptionMixIn):
            model_cls = _ResidentOption

            @classmethod
            def ident_fields(cls) -> Dict[str, _BaseModel]:
                return {"for_resident": self._model}

        return _OptionMixIn

    @classmethod
    async def from_visit(cls, visit: visits.Visit) -> Resident:
        raise NotImplementedError

    @classmethod
    async def from_name(cls, name: str) -> Resident:
        raise NoSuchResident

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
from typing import Optional, Type, Dict

from .utils import lazy_property

from .backend import Resident as _Resident, ResidentOption as _ResidentOption

from . import options
from . import visits


class ResidentOptionMixIn:
    model_cls = _ResidentOption

    @classmethod
    def ident_fields(cls) -> Dict[str, _Resident]:
        raise NotImplementedError


class Resident:
    def __init__(self) -> None:
        raise NotImplementedError

    @property
    def resident_id(self) -> int:
        raise NotImplementedError

    @property
    def _model(self) -> _Resident:
        raise NotImplementedError

    @lazy_property
    def _ResidentOptionMixIn(self) -> Type[ResidentOptionMixIn]:
        class _ResidentOptionMixIn(ResidentOptionMixIn):
            @classmethod
            def ident_fields(cls) -> Dict[str, _Resident]:
                return {"for_resident": self._model}

        return _ResidentOptionMixIn

    @lazy_property
    def StrOption(self) -> Type[options.StrOption]:
        class StrOption(
                options.StrOption, self._ResidentOptionMixIn):  # type: ignore
            pass

        return StrOption

    @lazy_property
    def IntOption(self) -> Type[options.IntOption]:
        class IntOption(
                options.IntOption, self._ResidentOptionMixIn):  # type: ignore
            pass

        return IntOption

    @lazy_property
    def FloatOption(self) -> Type[options.FloatOption]:
        class FloatOption(
                options.FloatOption,
                self._ResidentOptionMixIn):  # type: ignore
            pass

        return FloatOption

    async def from_visit(self, visit: visits.Visit) -> Optional[Resident]:
        raise NotImplementedError

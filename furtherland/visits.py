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
from typing import Type, Dict, Optional

from .utils import lazy_property

from .backend import BaseModel as _BaseModel, Visit as _Visit, \
    VisitOption as _VisitOption

from . import options
from . import residents

__all__ = ["Visit"]


class Visit(options.WithOption):
    def __init__(self) -> None:
        raise NotImplementedError

    @property
    def _model(self) -> _Visit:
        raise NotImplementedError

    @lazy_property
    def _OptionMixIn(self) -> Type[options.OptionMixIn]:
        class _OptionMixIn(options.OptionMixIn):
            model_cls = _VisitOption

            @classmethod
            def ident_fields(cls) -> Dict[str, _BaseModel]:
                return {"for_visit": self._model}

        return _OptionMixIn

    @classmethod
    async def create(cls) -> Visit:
        raise NotImplementedError

    async def get_resident(self) -> Optional[residents.Resident]:
        if self._model.for_resident is not None:
            pass

        raise NotImplementedError

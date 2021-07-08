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

from typing import Any, AsyncIterator, Dict, Type

from . import options
from .backend import BaseModel as _BaseModel
from .backend import Class as _Class
from .backend import ClassOption as _ClassOption
from .utils import lazy_property

__all__ = ["Class"]


class Class(options.WithOption):
    def __init__(self) -> None:
        raise NotImplementedError

    @property
    def _model(self) -> _Class:
        raise NotImplementedError

    @lazy_property
    def _OptionMixIn(self) -> Type[options.OptionMixIn]:
        class _OptionMixIn(options.OptionMixIn):
            model_cls = _ClassOption

            @classmethod
            def ident_fields(cls) -> Dict[str, _BaseModel]:
                return {"for_class": self._model}

        return _OptionMixIn

    @classmethod
    async def create(cls) -> Class:
        raise NotImplementedError

    def writings(self) -> AsyncIterator[Any]:
        raise NotImplementedError

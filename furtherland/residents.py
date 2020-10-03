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

from hakoniwa.utils import Json

from .exceptions import NoSuchResident
from .utils import lazy_property

from .backend import BaseModel as _BaseModel, Resident as _Resident, \
    ResidentOption as _ResidentOption, BackendMeta, \
    ResidencyStatus as ResidencyStatus

from . import options
from . import visits

import typing


__all__ = ["Resident", "ResidencyStatus"]

_meta = BackendMeta.get()


class Resident(options.WithOption):
    def __init__(self, model: _Resident) -> None:
        self._this_model = model

    @property
    def _model(self) -> _Resident:
        return self._this_model

    @lazy_property
    def _OptionMixIn(self) -> Type[options.OptionMixIn]:
        class _OptionMixIn(options.OptionMixIn):
            model_cls = _ResidentOption

            @classmethod
            def ident_fields(cls) -> Dict[str, _BaseModel]:
                return {"for_resident": self._model}

        return _OptionMixIn

    @property
    def resident_id(self) -> int:
        return typing.cast(int, self._model.id)

    @property
    def name(self) -> str:
        return typing.cast(str, self._model.name)

    @property
    def status(self) -> ResidencyStatus:
        return ResidencyStatus(self._model.status)

    @property
    def display_name(self) -> Optional[str]:
        return typing.cast(Optional[str], self._model.display_name)

    @property
    def email_md5(self) -> Optional[str]:
        return typing.cast(Optional[str], self._model.email_md5)

    @property
    def email(self) -> Optional[str]:
        return typing.cast(Optional[str], self._model.email)

    @property
    def homepage(self) -> Optional[str]:
        return typing.cast(Optional[str], self._model.homepage)

    @property
    def output_public(self) -> Json:
        result: Dict[str, Json] = {
            "id": self.resident_id,
            "name": self.name,
            "status": self.status.to_string()
        }

        if self.display_name is not None:
            result["display_name"] = self.display_name

        if self.email_md5 is not None:
            result["email_md5"] = self.email_md5

        if self.homepage is not None:
            result["homepage"] = self.homepage

        return result  # type: ignore

    @property
    def output_private(self) -> Json:
        result = self.output_public

        if self.email is not None:
            result["email"] = self.email  # type: ignore

        return result

    @classmethod
    async def from_visit(cls, visit: visits.Visit) -> Resident:
        raise NotImplementedError

    @classmethod
    async def from_name(cls, name: str) -> Resident:
        try:
            model = await _meta.mgr.get(_Resident, name=name)

        except _Resident.DoesNotExist as e:
            raise NoSuchResident from e

        return cls(model)

    @classmethod
    async def create(
            cls, name: str, status: ResidencyStatus = ResidencyStatus.Resident,
            display_name: Optional[str] = None,
            password_hash: Optional[str] = None,
            totp_hash: Optional[str] = None,
            email_md5: Optional[str] = None,
            email: Optional[str] = None,
            homepage: Optional[str] = None) -> Resident:

        model = await _Resident.create_resident(
            name=name, status=status, display_name=display_name,
            password_hash=password_hash, totp_hash=totp_hash,
            email_md5=email_md5, email=email, homepage=homepage)

        return cls(model)

    @classmethod
    async def count(cls) -> int:
        return typing.cast(int, await _meta.mgr.count(_Resident.select()))

    def verify_totp(self, code: int) -> bool:
        raise NotImplementedError

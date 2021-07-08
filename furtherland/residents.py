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

from typing import Dict, Optional, Type
import typing

from tortoise.exceptions import DoesNotExist
import passlib.hash.scram as passlib_scram

from hakoniwa.utils import Json

from . import options, visits
from .backend import Backend
from .backend import BaseModel as _BaseModel
from .backend import ResidencyStatus as ResidencyStatus
from .backend import Resident as _Resident
from .backend import ResidentOption as _ResidentOption
from .exceptions import NoSuchResident
from .utils import lazy_property

__all__ = ["Resident", "ResidencyStatus"]


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
        return typing.cast(int, self._model.id)  # type: ignore

    @property
    def name(self) -> str:
        return self._model.name

    @property
    def status(self) -> ResidencyStatus:
        return self._model.status

    @property
    def display_name(self) -> Optional[str]:
        return self._model.display_name

    @property
    def email_md5(self) -> Optional[str]:
        return self._model.email_md5

    @property
    def email(self) -> Optional[str]:
        return self._model.email

    @property
    def homepage(self) -> Optional[str]:
        return self._model.homepage

    @property
    def output_public(self) -> Json:
        result: Dict[str, Json] = {
            "id": self.resident_id,
            "name": self.name,
            "status": self.status.to_string(),
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
            model = await _Resident.get(name=name)

        except DoesNotExist as e:
            raise NoSuchResident from e

        return cls(model)

    @classmethod
    async def create(
        cls,
        name: str,
        status: ResidencyStatus = ResidencyStatus.Resident,
        display_name: Optional[str] = None,
        password_hash: Optional[str] = None,
        totp_hash: Optional[str] = None,
        email_md5: Optional[str] = None,
        email: Optional[str] = None,
        homepage: Optional[str] = None,
    ) -> Resident:

        model = await _Resident.create_resident(
            name=name,
            status=status,
            display_name=display_name,
            password_hash=password_hash,
            totp_hash=totp_hash,
            email_md5=email_md5,
            email=email,
            homepage=homepage,
        )

        return cls(model)

    @classmethod
    async def count(cls) -> int:
        return await _Resident.all().count()

    async def change_password(self, new_password: str) -> None:
        hash_ = typing.cast(str, passlib_scram.hash(new_password))
        await self._model.change_password_hash(hash_)

    def verify_totp(self, code: int) -> bool:
        raise NotImplementedError

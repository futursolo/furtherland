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

from __future__ import annotations  # noqa: F401

from typing import Optional
import datetime
import enum
import typing

from tortoise import fields
from tortoise.fields import data as d_fields
from tortoise.fields import relational as ref_fields

from .common import Backend, BaseModel
from .options import BaseOption

if typing.TYPE_CHECKING:
    from .replies import Reply
    from .visits import Visit
    from .works import Work

__all__ = ["ResidencyStatus", "Resident", "ResidentOption"]


@enum.unique
class ResidencyStatus(enum.IntEnum):
    Disabled = -1  # nologin

    Pending = 0  # pending approval,
    # only available if manual approval is enabled.

    Resident = 10  # Can comment, Edit their Profile

    # Can create writings/pages, can edit their own writings/pages.
    Writer = 20
    # with everything visitors can do.

    # Canedit all writings/pages, can create/edit resident profiles.
    Moderator = 50
    # with everything writers can do.

    Master = 100  # Can change Site wide settings.
    # Please note that the first resident will automatically become master.

    def to_string(self) -> str:
        if self == ResidencyStatus.Disabled:
            return "disabled"

        elif self == ResidencyStatus.Pending:
            return "pending"

        elif self == ResidencyStatus.Resident:
            return "resident"

        elif self == ResidencyStatus.Writer:
            return "writer"

        elif self == ResidencyStatus.Moderator:
            return "moderator"

        elif self == ResidencyStatus.Master:
            return "master"

        raise NotImplementedError


@Backend.add_model
class Resident(BaseModel):
    name = d_fields.CharField(
        null=False, index=True, unique=True, max_length=64
    )
    display_name = d_fields.TextField()

    status = d_fields.IntEnumField(ResidencyStatus, null=False)

    password_hash = d_fields.TextField()  # passlib.hash.scram
    totp_hash = d_fields.TextField()

    email_md5 = d_fields.CharField(index=True, unique=True, max_length=32)
    email = d_fields.CharField(index=True, unique=True, max_length=254)
    homepage = d_fields.TextField()

    created = d_fields.DatetimeField(null=False, auto_now_add=True)

    language = d_fields.CharField(max_length=10)

    options: ref_fields.ReverseRelation[ResidentOption]
    visits: ref_fields.ReverseRelation[Visit]

    works: ref_fields.ReverseRelation[Work]
    replies: ref_fields.ReverseRelation[Reply]

    @classmethod
    async def create_resident(
        cls,
        name: str,
        *,
        status: ResidencyStatus = ResidencyStatus.Resident,
        display_name: Optional[str] = None,
        password_hash: Optional[str] = None,
        totp_hash: Optional[str] = None,
        email_md5: Optional[str] = None,
        email: Optional[str] = None,
        homepage: Optional[str] = None,
    ) -> Resident:
        return await cls.create(
            name=name,
            status=status,
            display_name=display_name,
            password_hash=password_hash,
            totp_hash=totp_hash,
            email_md5=email_md5,
            email=email,
            homepage=homepage,
        )

    async def change_password_hash(self, password_hash: str) -> None:
        self.update_from_dict({"password_hash": password_hash})
        await self.save(update_fields=["password_hash"], force_update=True)


@Backend.add_model
class ResidentOption(BaseOption):
    name = d_fields.CharField(null=False, index=True, max_length=254)
    for_resident: ref_fields.ForeignKeyRelation[
        Resident
    ] = ref_fields.ForeignKeyField(
        Resident._meta.full_name,
        index=True,
        related_name="options",
        on_delete="CASCADE",
    )

    _ident_fields = set(["for_resident"])

    class Meta:
        unique_together = (("name", "for_resident"),)

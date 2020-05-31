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

from .common import BaseModel, meta
from .options import BaseOption

from peewee import CharField, BigIntegerField, DateTimeField, \
    ForeignKeyField, FixedCharField, TextField

import datetime
import enum

__all__ = ["ResidencyStatus", "Resident", "ResidentOption"]


@enum.unique
class ResidencyStatus(enum.IntEnum):
    Disabled = -1  # nologin

    Pending = 0  # pending approval,
    # only available if manual approval is enabled.

    Visitor = 10  # Can comment, Edit their Profile

    # Can create writings/pages, can edit their own writings/pages.
    Writer = 20
    # with everything visitors can do.

    # Canedit all writings/pages, can create/edit resident profiles.
    Moderator = 50
    # with everything writers can do.

    Master = 100  # Can change Site wide settings.
    # Please note that the first resident will automatically become master.


class Resident(BaseModel):
    name = CharField(null=False, index=True, unique=True, max_length=64)
    display_name = TextField()

    status = BigIntegerField(null=False)

    password_hash = TextField()  # passlib.hash.scram
    totp_hash = TextField()

    email_md5 = FixedCharField(index=True, unique=True, max_length=32)
    email = CharField(index=True, unique=True, max_length=254)
    homepage = TextField()

    created = DateTimeField(null=False, default=datetime.datetime.utcnow)

    language = CharField(max_length=10)

    @classmethod
    async def create_resident(
            cls, name: str, *,
            status: ResidencyStatus = ResidencyStatus.Visitor,
            display_name: Optional[str] = None,
            password_hash: Optional[str] = None,
            totp_hash: Optional[str] = None,
            email_md5: Optional[str] = None,
            email: Optional[str] = None,
            homepage: Optional[str] = None) -> Resident:
        resident: Resident = await meta.mgr.create(
            cls, name=name, status=status, display_name=display_name,
            password_hash=password_hash, totp_hash=totp_hash,
            email_md5=email_md5, email=email, homepage=homepage)

        return resident


class ResidentOption(BaseOption):
    name = CharField(null=False, index=True, max_length=254)
    for_resident = ForeignKeyField(Resident, index=True, backref="options")

    _ident_fields = ["for_resident"]

    class Meta:
        indexes = (
            (("name", "for_resident"), True),
        )

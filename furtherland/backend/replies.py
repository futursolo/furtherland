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

import datetime
import enum

from tortoise import fields
from tortoise.fields import data as d_fields
from tortoise.fields import relational as ref_fields

from .common import Backend, BaseModel
from .options import BaseOption
from .residents import Resident
from .works import Work

__all__ = ["Reply", "ReplyOption"]


@enum.unique
class ReplyStatus(enum.IntEnum):
    Hidden = -1
    Pending = 0
    Approved = 1


@Backend.add_model
class Reply(BaseModel):

    # html.escape
    # re.sub(re.compile(r"(data:)", re.IGNORECASE), "data：")
    # re.sub(re.compile(r"(javascript:)", re.IGNORECASE), "javascript：")
    content = d_fields.TextField()
    content_rendered = d_fields.TextField()

    status = d_fields.IntEnumField(ReplyStatus, null=False)

    for_work = ref_fields.ForeignKeyField(
        Work._meta.full_name,
        index=True,
        related_name="replies",
        on_delete="CASCADE",
    )
    for_resident = ref_fields.ForeignKeyField(
        Resident._meta.full_name,
        index=True,
        related_name="replies",
        on_delete="CASCADE",
    )

    # html.escape
    visitor_name = d_fields.TextField()
    visitor_email_md5 = d_fields.CharField(
        index=True, unique=True, max_length=32
    )
    visitor_email = d_fields.CharField(index=True, unique=True, max_length=254)
    visitor_homepage = d_fields.TextField()
    visitor_ip = d_fields.CharField(null=False, max_length=40)
    visitor_user_agent = d_fields.TextField()

    created = d_fields.DatetimeField(null=False, auto_now_add=True)

    parent = ref_fields.ForeignKeyField(
        "models.Reply", null=True, index=True, related_name="children"
    )

    options: ref_fields.ReverseRelation[ReplyOption]
    children: ref_fields.ReverseRelation[Reply]


@Backend.add_model
class ReplyOption(BaseOption):
    name = d_fields.CharField(null=False, index=True, max_length=254)
    for_reply = ref_fields.ForeignKeyField(
        Reply._meta.full_name,
        index=True,
        related_name="options",
        on_delete="CASCADE",
    )

    _ident_fields = set(["for_reply"])

    class Meta:
        unique_together = (("name", "for_reply"),)

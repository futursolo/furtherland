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
import typing

from tortoise import fields
from tortoise.fields import data as d_fields
from tortoise.fields import relational as ref_fields

from ..env import BackendEnvStore
from .classes import Class
from .common import Backend, BaseModel
from .options import BaseOption
from .residents import Resident
from .tags import Tag

if typing.TYPE_CHECKING:
    from .replies import Reply

__all__ = ["Work", "WorkOption"]


@enum.unique
class WorkType(enum.IntEnum):
    Writing = 0
    Page = 1


@enum.unique
class WorkStatus(enum.IntEnum):
    Trash = -2
    Private = -1
    Draft = 0
    Published = 1


@Backend.add_model
class Work(BaseModel):
    slug = d_fields.CharField(
        null=False, unique=True, index=True, max_length=254
    )
    title = d_fields.TextField()

    content = d_fields.TextField()
    content_rendered = d_fields.TextField()

    status = d_fields.IntEnumField(WorkStatus, null=False)

    created = d_fields.DatetimeField(null=False, auto_now_add=True)
    modified = d_fields.DatetimeField(null=False, auto_now=True)

    allow_comments = d_fields.BooleanField(null=False, default=True)

    type_ = d_fields.IntEnumField(WorkType, null=False, index=True)

    for_resident: ref_fields.ForeignKeyRelation[
        Resident
    ] = ref_fields.ForeignKeyField(
        Resident._meta.full_name,
        index=True,
        related_name="works",
        on_delete="SET NULL",
    )
    for_class: ref_fields.ForeignKeyRelation[
        Class
    ] = ref_fields.ForeignKeyField(
        Class._meta.full_name,
        index=True,
        related_name="works",
        on_delete="SET NULL",
    )

    tags: ref_fields.ManyToManyRelation[Tag] = ref_fields.ManyToManyField(
        Tag._meta.full_name,
        related_name="works",
        through=BackendEnvStore.get().table_prefix.get() + "work_tag_rels",
    )

    options: ref_fields.ReverseRelation[WorkOption]
    replies: ref_fields.ReverseRelation[Reply]


@Backend.add_model
class WorkOption(BaseOption):
    name = d_fields.CharField(null=False, index=True, max_length=254)
    for_work: ref_fields.ForeignKeyRelation[Work] = ref_fields.ForeignKeyField(
        Work._meta.full_name,
        index=True,
        related_name="options",
        on_delete="CASCADE",
    )

    _ident_fields = set(["for_work"])

    class Meta:
        unique_together = (("name", "for_work"),)

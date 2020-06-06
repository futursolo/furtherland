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

from .common import BaseModel, BackendMeta

from peewee import ForeignKeyField, CharField, DateTimeField, TextField, \
    BooleanField, IntegerField
from .residents import Resident
from .options import BaseOption
from .classes import Class
from .tags import Tag

import datetime
import enum

__all__ = ["Work", "WorkOption"]

_meta = BackendMeta.get()


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


@_meta.add_model
class Work(BaseModel):
    slug = CharField(null=False, unique=True, index=True, max_length=254)
    title = TextField()

    content = TextField()
    content_rendered = TextField()

    status = IntegerField(null=False)

    created = DateTimeField(null=False, default=datetime.datetime.utcnow)
    modified = DateTimeField(null=True, default=datetime.datetime.utcnow)

    allow_comments = BooleanField(null=False, default=True)

    _Type = IntegerField(null=False, index=True)

    for_resident = ForeignKeyField(
        Resident, index=True, backref="visits", on_delete="SET NULL")
    for_class = ForeignKeyField(
        Class, index=True, backref="options", on_delete="SET NULL")


@_meta.add_model
class WorkOption(BaseOption):
    name = CharField(null=False, index=True, max_length=254)
    for_work = ForeignKeyField(
        Work, index=True, backref="options", on_delete="CASCADE")

    _ident_fields = ["for_work"]

    class Meta:
        indexes = (
            (("name", "for_work"), True),
        )


@_meta.add_model
class WorkTagRelationship(BaseModel):
    for_tag = ForeignKeyField(
        Tag, index=True, backref="work_rels", on_delete="CASCADE")
    for_work = ForeignKeyField(
        Work, index=True, backref="tag_rels", on_delete="CASCADE")

    class Meta:
        indexes = (
            (("for_work", "for_tag"), True),
        )

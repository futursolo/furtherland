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

import typing

from tortoise import fields
from tortoise.fields import data as d_fields
from tortoise.fields import relational as ref_fields

from .common import Backend, BaseModel
from .options import BaseOption

if typing.TYPE_CHECKING:
    from .works import Work

__all__ = ["Class", "ClassOption"]


@Backend.add_model
class Class(BaseModel):
    slug = d_fields.CharField(
        null=False, index=True, unique=True, max_length=254
    )
    display_name = d_fields.TextField()
    description = d_fields.TextField()
    parent = ref_fields.ForeignKeyField(
        "models.Class", related_name="children", null=True, index=True
    )

    options: ref_fields.ReverseRelation[ClassOption]
    children: ref_fields.ReverseRelation[Class]

    works: ref_fields.ReverseRelation[Work]


@Backend.add_model
class ClassOption(BaseOption):
    name = d_fields.CharField(null=False, index=True, max_length=254)
    for_class: ref_fields.ForeignKeyRelation[
        Class
    ] = ref_fields.ForeignKeyField(
        Class._meta.full_name,
        index=True,
        related_name="options",
        on_delete="CASCADE",
    )

    _ident_fields = set(["for_class"])

    class Meta:
        unique_together = (("name", "for_class"),)

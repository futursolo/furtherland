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

from tortoise import fields
from tortoise.fields import data as d_fields
from tortoise.fields import relational as ref_fields

from .common import Backend, BaseModel
from .options import BaseOption
from .residents import Resident

__all__ = ["Visit", "VisitOption"]


@Backend.add_model
class Visit(BaseModel):
    for_resident: ref_fields.ForeignKeyRelation[
        Resident
    ] = ref_fields.ForeignKeyField(
        Resident._meta.full_name,
        index=True,
        null=True,
        on_delete="CASCADE",
        related_name="visits",
    )

    last_active = d_fields.DatetimeField(null=False, auto_now_add=True)
    last_verify = (
        d_fields.DatetimeField()
    )  # Last time the password is entered.
    last_ip = d_fields.CharField(null=False, max_length=40)
    last_user_agent = d_fields.TextField()

    options: ref_fields.ReverseRelation[VisitOption]


@Backend.add_model
class VisitOption(BaseOption):
    name = d_fields.CharField(null=False, index=True, max_length=254)
    for_visit: ref_fields.ForeignKeyRelation[
        Visit
    ] = ref_fields.ForeignKeyField(
        Visit._meta.full_name,
        index=True,
        related_name="options",
        on_delete="CASCADE",
    )

    _ident_fields = set(["for_visit"])

    class Meta:
        unique_together = (("name", "for_visit"),)

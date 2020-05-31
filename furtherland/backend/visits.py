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

from .common import BaseModel

from peewee import ForeignKeyField, CharField
from .residents import Resident
from .options import BaseOption

__all__ = ["Visit", "VisitOption"]


class Visit(BaseModel):
    for_resident = ForeignKeyField(Resident, backref="visits")


class VisitOption(BaseOption):
    name = CharField(null=False, index=True, max_length=254)
    for_visit = ForeignKeyField(Visit, index=True, backref="options")

    _ident_fields = ["for_visit"]

    class Meta:
        indexes = (
            (("name", "for_visit"), True),
        )

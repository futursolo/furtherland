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

from peewee import ForeignKeyField, CharField, TextField, DateTimeField, \
    IntegerField, FixedCharField
from .options import BaseOption
from .works import Work
from .residents import Resident

import datetime

__all__ = ["Reply", "ReplyOption"]


class ReplyStatus:
    Hidden = -1
    Pending = 0
    Approved = 1


class Reply(BaseModel):

    # html.escape
    # re.sub(re.compile(r"(data:)", re.IGNORECASE), "data：")
    # re.sub(re.compile(r"(javascript:)", re.IGNORECASE), "javascript：")
    content = TextField()
    content_rendered = TextField()

    status = IntegerField(null=False)

    for_work = ForeignKeyField(
        Work, index=True, backref="replies", on_delete="CASCADE")
    for_resident = ForeignKeyField(
        Resident, index=True, backref="replies", on_delete="CASCADE")

    # html.escape
    visitor_name = TextField()
    visitor_email_md5 = FixedCharField(index=True, unique=True, max_length=32)
    visitor_email = CharField(index=True, unique=True, max_length=254)
    visitor_homepage = TextField()
    visitor_ip = CharField(null=False, max_length=40)
    visitor_user_agent = TextField()

    created = DateTimeField(null=False, default=datetime.datetime.utcnow)

    parent = ForeignKeyField("self", null=True, index=True, backref="children")


class ReplyOption(BaseOption):
    name = CharField(null=False, index=True, max_length=254)
    for_reply = ForeignKeyField(
        Reply, index=True, backref="options", on_delete="CASCADE")

    _ident_fields = ["for_reply"]

    class Meta:
        indexes = (
            (("name", "for_reply"), True),
        )

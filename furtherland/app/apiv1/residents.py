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

from ...exceptions import OutOfScope, MethodNotAllowed, BadRequest

from ... import residents
from .common import RestRequestHandler

import hashlib
import email_validator


class ResidentHandler(RestRequestHandler):
    async def get(self, **kwargs: str) -> None:
        resident_name: str = kwargs.get("name", "")

        if not resident_name:
            self.set_header("x-land-accepted-oauth-scopes", "residents:list")
            raise OutOfScope

        resident = await residents.Resident.from_name(resident_name)

        self.ok(resident.output_public)

    async def post(self, **kwargs: str) -> None:
        if kwargs.get("name", ""):
            raise MethodNotAllowed

        resident_count = await residents.Resident.count()

        if resident_count > 0:
            self.set_header("x-land-accepted-oauth-scopes", "residents:create")
            raise OutOfScope

        try:
            name = self.body["name"]
            password = self.body["password"]
            email = self.body["email"]

            if not (isinstance(name, str) and isinstance(password, str) and
                    isinstance(email, str)):
                raise TypeError

            email_validator.validate_email(email, check_deliverability=False)

        except (KeyError, TypeError, email_validator.EmailNotValidError) as e:
            raise BadRequest from e

        resident = await residents.Resident.create(
            name=name, status=residents.ResidencyStatus.Master,
            email_md5=hashlib.md5(email.encode("utf-8")).hexdigest(),
            email=email)

        await resident.change_password(password)

        await self.ok(resident.output_private)

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

from ...exceptions import OutOfScope

from ... import residents
from .common import RestRequestHandler


class ResidentHandler(RestRequestHandler):
    async def get(self, **kwargs: str) -> None:
        resident_name: str = kwargs.get("name", "")

        if not resident_name:
            self.set_header("x-accepted-oauth-scopes", "residents:list")
            raise OutOfScope

        resident = await residents.Resident.from_name(resident_name)

        self.ok(str(resident))

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

from typing import Any, Dict


class GraphQLError(Exception):
    @property
    def exts(self) -> Dict[str, Any]:
        return {}

    @property
    def reason(self) -> str:
        return "Unknown GraphQL Error"


class OutOfScope(GraphQLError):
    reason = "Token is not authorised with scope required for this request."

    def __init__(self, required_scope: str, *args: Any) -> None:
        self._required_scope = required_scope

        super().__init__(*args)

    @property
    def required_scope(self) -> str:
        return self._required_scope

    @property
    def exts(self) -> Dict[str, Any]:
        return {"required_scope": self.required_scope}


class NoSuchResident(GraphQLError):
    reason = "No such resident."

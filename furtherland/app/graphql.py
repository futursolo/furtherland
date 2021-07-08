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

from typing import Any, Dict, Optional
import json

import hakoniwa
import pydantic

from .. import graphql
from ..utils import BaseModel
from .common import BaseRequestHandler


class GraphQLRequest(BaseModel):
    query: str
    variables: Dict[str, Any]
    operation_name: Optional[str]


class GraphQLHandler(BaseRequestHandler):
    async def post(self, **kwargs: str) -> str:

        try:
            gql_req = GraphQLRequest.parse_obj(self.body)

        except pydantic.ValidationError as e:
            raise hakoniwa.HttpError(400) from e

        engine = await graphql.get_engine()

        self.set_header("content-type", "application/json")

        return json.dumps(
            await engine.execute(
                query=gql_req.query,
                operation_name=gql_req.operation_name,
                variables=gql_req.variables,
                context={"land": self.land},
            )
        )

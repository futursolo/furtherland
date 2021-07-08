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

import urllib.parse

import certifi

from .common import BaseEnvStore, BoolEnv, MalformedEnvError, StrEnv

__all__ = ["BackendEnvStore"]


class BackendUrlEnv(StrEnv):
    def adjust_value(self, v: str) -> str:
        try:
            parsed_url = urllib.parse.urlparse(v)
            # scheme://netloc/path;parameters?query#fragment

            if parsed_url.fragment or parsed_url.params or parsed_url.query:
                raise ValueError(
                    "You cannot have fragments, parameters and/or queries "
                    "in the URL."
                )

            if parsed_url.scheme == "mysql":
                url_scheme = "mysql+async"

            elif parsed_url.scheme in ("pgsql", "postgres"):
                url_scheme = "postgres+async"

            else:
                raise ValueError(
                    f"Unsupported URL Scheme: {parsed_url.scheme}"
                )

            if parsed_url.path.rfind("/") != 0:
                raise ValueError("You cannot have / in database name.")

        except ValueError as e:
            raise MalformedEnvError(
                "The valid URL format is `(mysql|pgsql|postgres)://"
                "username:password@db.server[:port]/database`."
            ) from e

        url_scheme + parsed_url.netloc + parsed_url.path
        adjusted_url = f"{url_scheme}://{parsed_url.netloc}{parsed_url.path}"

        return adjusted_url


class BackendCaPathEnv(StrEnv):
    def adjust_value(self, v: str) -> str:
        return v if v else certifi.where()

    def _get_default(self) -> str:
        try:
            return super()._get_default()

        except KeyError:
            return certifi.where()

    def _get_env_file_default_hint(self) -> str:
        return "certifi.where()"


class BackendEnvStore(BaseEnvStore):
    _prefix = "BACKEND_"

    url = BackendUrlEnv(
        "URL",
        [
            "Valid format: (mysql|pgsql|postgres)://"
            "username:password@db.server[:port]/database",
            "Currently only supports MySQL and PostgreSQL.",
        ],
        display_name="Backend Database URL",
        required=True,
    )

    table_prefix = StrEnv(
        "TABLE_PREFIX",
        display_name="Database Table Prefix",
        default="furtherland_",
    )

    use_tls = BoolEnv(
        "USE_TLS",
        display_name="Whether to use TLS for Backend Database",
        default=False,
    )

    ca_path = BackendCaPathEnv(
        "CA_PATH", display_name="Path to CA Certificate"
    )

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

from .store import EnvStore

import sys
import os
import argparse


def main() -> None:
    parser = argparse.ArgumentParser(
        "python3 -m furtherland.env",
        description="Furtherland Env File Creator.")
    parser.add_argument("-E", "--env-file", default=os.getcwd(),
                        help="Location to create the env file")
    parser.add_argument("--override", action='store_true',
                        help="Override existing env file", default=False)

    parsed_args = parser.parse_args()

    env_path: str = os.path.abspath(parsed_args.env_file)

    if os.path.isdir(env_path) or env_path.endswith("/"):
        dir_path = os.path.abspath(env_path)
        file_path = os.path.join(dir_path, "furtherland.env")

    elif not env_path.endswith(".env"):
        print("Env file has to have extension `.env`!")
        sys.exit(1)

        return

    else:
        file_path = os.path.abspath(env_path)
        dir_path = os.path.dirname(file_path)

    if os.path.exists(file_path) and not parsed_args.override:
        print(f"File {file_path} already exists!")
        sys.exit(1)

        return

    os.makedirs(dir_path, exist_ok=True)

    with open(file_path, "w+") as f:
        f.write(
            "\n".join(EnvStore.get(_skip_required=True)._to_env_file_str()))

    print(f"New env file is created at {file_path}.")


if __name__ == "__main__":
    main()

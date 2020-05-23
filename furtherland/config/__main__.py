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

from typing import List

import sys
import os
import argparse
import shutil

_SRC_PATH = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), "_sample_config.py")


def main() -> None:
    parser = argparse.ArgumentParser(description="Furtherland Config Creator.")
    parser.add_argument("-C", "--config-path", default=os.getcwd(),
                        help="Path to create the config file.")

    parsed_args = parser.parse_args()

    config_path: str = os.path.abspath(parsed_args.config_path)

    if os.path.isdir(config_path) or config_path.endswith("/"):
        dir_path = os.path.abspath(config_path)
        file_path = os.path.join(dir_path, "config.py")

    elif not config_path.endswith(".py"):
        print("Config file has to have extension `.py`!")
        sys.exit(1)

        return

    else:
        file_path = os.path.abspath(config_path)
        dir_path = os.path.dirname(file_path)

    if os.path.exists(file_path):
        print(f"File {file_path} already exists!")
        sys.exit(1)

        return

    os.makedirs(dir_path, exist_ok=True)

    final_path = shutil.copy(_SRC_PATH, file_path)

    print(f"New config file is created at {final_path}.")


if __name__ == "__main__":
    main()

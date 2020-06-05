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


import os

_assets_root_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "assets")

_sketches_root_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "sketches")


def get_asset_root() -> str:
    return _assets_root_path


def get_asset_path(path: str) -> str:
    asset_path = os.path.join(_assets_root_path, path)
    assert os.path.exists(asset_path), f"Path: {asset_path} does not exist."

    return asset_path


def get_sketch_root() -> str:
    return _sketches_root_path


def get_sketch_path(path: str) -> str:
    sketch_path = os.path.join(_sketches_root_path, path)
    assert os.path.exists(sketch_path), f"Path: {sketch_path} does not exist."

    return sketch_path


__all__ = ["get_asset_root", "get_asset_path",
           "get_sketch_root", "get_sketch_path"]

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
#   Copyright 2015 Futur Solo
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

try:
    import sys
    if sys.version_info.major < 3:
        raise
    if sys.version_info.minor < 3:
        raise
except:
    print("FurtherLand needs as least Python3.3 or higher.")
    print("Please upgrade your Python version.")
    exit(1)

try:
    import tornado
except:
    print("Please install tornado Firstly")
    exit(1)

try:
    import motor
except:
    print("Please install motor Firstly")
    exit(1)

try:
    import misaka
except:
    print("Please install misaka Firstly")
    exit(1)

try:
    import mako
except:
    print("Please install mako Firstly")
    exit(1)

try:
    import pycurl
except:
    print("Please install pycurl Firstly")
    exit(1)

try:
    import feedgen
except:
    print("Please install feedgen Firstly")
    exit(1)

try:
    from . import melody
    secret = melody.secret
    base = melody.base
    safeland = melody.safeland
    dev = melody.dev
    listen_ip = melody.listen_ip
    listen_port = melody.listen_port
    library = melody.library
    import pymongo

except:
    print("You should Configure melody.py correctly firstly.")
    exit(1)

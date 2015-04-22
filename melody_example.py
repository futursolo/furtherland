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


secret = ""
# This will be the top secret of the FurtherLand

base = __file__
# There the FurtherLand exactly located

safeland = False
# Turn it to True if you want your Visitors to Visit FurtherLand in HTTPS only.
# Furthermore, this will also enable some HTTPS only Protection, such as:
# Secure Only Cookies, HSTS Header, etc.

dev = False
# Turn it to True if you are building FurtherLand
# Make Sure to Turn it to False when FurtherLand is ready to Serve Visitors

listen_ip = "127.0.0.1"
listen_port = 1741
# The place the FurtherLand will rise

library = {
    "host": "",
    "port": "",
    "auth": True,
    "user": "",
    "passwd": "",
    "database": "",
    "prefix": ""
}
# This is the Library of FurtherLand
# If the Library is open to Public(Connect Without Authentication),
# Turn auth option to False and leave user and passwd arguments blank
# BUT DO NOT REMOVE THEM!

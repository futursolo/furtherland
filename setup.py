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

try:
    from setuptools import find_packages, setup

except ImportError as e:
    raise RuntimeError("setuptools is required for the installation.") from e

import sys

if not sys.version_info[:3] >= (3, 7, 0):
    raise RuntimeError("Teleme requires Python 3.7.0 or higher.")

setup_requires = ["setuptools>=43",
                  "setuptools-scm>=3.5.0", "importlib_metadata>=1.6.0"]

install_requires = [
    i for i in open("requirements.txt").readlines() if i.find("==") != -1]
install_requires.extend(setup_requires)

if __name__ == "__main__":
    setup(
        name="furtherland",
        use_scm_version={"local_scheme": lambda v: ""},
        python_requires=">=3.7.0",
        author="Kaede Hoshikawa",
        author_email="futursolo@icloud.com",
        url="https://github.com/futursolo/furtherland",
        license="Apache License 2.0",
        description="A Light-weight, pluggable Blog Platform",
        long_description=open("README.rst", "r").read(),
        packages=["furtherland", *
                  [f"furtherland.{i}" for i in find_packages("furtherland")]],
        include_package_data=True,
        setup_requires=setup_requires,
        install_requires=install_requires,
        zip_safe=False,
        classifiers=[
            "Operating System :: MacOS",
            "Operating System :: MacOS :: MacOS X",
            "Operating System :: Microsoft",
            "Operating System :: Microsoft :: Windows",
            "Operating System :: POSIX",
            "Operating System :: POSIX :: Linux",
            "Operating System :: Unix",
            "Operating System :: POSIX :: BSD",
            "Operating System :: POSIX :: BSD :: FreeBSD",
            "Programming Language :: Python",
            "Programming Language :: Python :: 3 :: Only",
            "Programming Language :: Python :: Implementation :: CPython"
        ]
    )

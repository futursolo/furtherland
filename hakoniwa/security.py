#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
#   Copyright 2019 Kaede Hoshikawa
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

import hmac
import abc
import base64
import os
import hashlib
import time
import datetime


class BaseSecurityContext(abc.ABC):
    @staticmethod
    def get_random_str(s_len: int, *, altchars: bytes = b"+/") -> str:
        data = os.urandom(s_len)
        return base64.b64encode(
            data, altchars=altchars)[:s_len].decode("ascii")

    @staticmethod
    def get_timestamp_bytes() -> bytes:
        time_hex = hex(int(time.time()))[2:]

        if len(time_hex) % 2 == 1:
            time_hex = "0" + time_hex

        return bytes.fromhex(time_hex)

    @staticmethod
    def recover_timestamp(time_bytes: bytes) -> int:
        return int(time_bytes.hex(), 16)

    @abc.abstractmethod
    def generate_secure_data(self, data: bytes) -> bytes:
        raise NotImplementedError

    @abc.abstractmethod
    def lookup_origin_data(
            self, signed_data: bytes, max_age: datetime.timedelta) -> bytes:
        raise NotImplementedError


class HmacSha256SecurityContext(BaseSecurityContext):
    def __init__(self, __secret: bytes) -> None:
        self.__secret = __secret

    def generate_secure_data(self, data: bytes) -> bytes:
        """
        Signed text using hashlib.sha256.

        format: :code:`[timestamp_len][timestamp][data][signature]`
        """
        timestamp = self.get_timestamp_bytes()
        timestamp_len = hex(len(timestamp))[2:]

        if len(timestamp_len) % 2 == 1:
            timestamp_len = "0" + timestamp_len

        timestamp_bytes = bytes.fromhex(timestamp_len)

        before_signed = timestamp_bytes + timestamp + data

        hmac_obj = hmac.new(
            self.__secret, msg=before_signed, digestmod=hashlib.sha256)

        return before_signed + hmac_obj.digest()

    def lookup_origin_data(
            self, signed_data: bytes, max_age: datetime.timedelta) -> bytes:
        before_signed, signature = signed_data[:-32], signed_data[-32:]

        hmac_obj = hmac.new(
            self.__secret, msg=before_signed, digestmod=hashlib.sha256)

        if not hmac.compare_digest(signature, hmac_obj.digest()):
            raise ValueError("Invalid Signature")

        timestamp_len = before_signed[0]
        timestamp = int(before_signed[1:1 + timestamp_len].hex(), 16)

        max_age_sec = int(max_age.total_seconds())

        if max_age_sec > 0 and timestamp + max_age_sec < int(time.time()):
            raise TimeoutError(
                "The signature is valid, but it has expired. If you want to "
                "extract the data anyways, set `max_age` to "
                "`datetime.timedelta(seconds=0)`.")

        return before_signed[1 + timestamp_len:]

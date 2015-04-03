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
#
#   Modified from pyotp
#   https://github.com/marcobiscaro2112/pyotp/tree/python3
#   With Python3 Support

try:
    from urllib.parse import quote
except ImportError:
    from urllib import quote

import base64
import random
import hashlib
import hmac
import datetime
import time


def random_base32(length=16, random=random.SystemRandom(),
                  chars=list('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567')):
    return ''.join(
        random.choice(chars)
        for i in range(length)
    )


def build_uri(secret, name, initial_count=None, issuer_name=None):
    is_initial_count_present = (initial_count is not None)

    otp_type = 'hotp' if is_initial_count_present else 'totp'
    base = 'otpauth://%s/' % otp_type

    if issuer_name:
        issuer_name = quote(issuer_name)
        base += '%s:' % issuer_name

    uri = '%(base)s%(name)s?secret=%(secret)s' % {
        'name': quote(name, safe='@'),
        'secret': secret,
        'base': base,
    }

    if is_initial_count_present:
        uri += '&counter=%s' % initial_count

    if issuer_name:
        uri += '&issuer=%s' % issuer_name

    return uri


def strings_equal(s1, s2):
    try:
        from hmac import compare_digest
        return compare_digest(s1, s2)
    except ImportError:
        pass

    if len(s1) != len(s2):
        return False

    differences = 0
    for c1, c2 in zip(s1, s2):
        differences |= ord(c1) ^ ord(c2)
    return differences == 0


class OTP(object):
    def __init__(self, s, digits=6, digest=hashlib.sha1):
        self.digits = digits
        self.digest = digest
        self.secret = s

    def generate_otp(self, input):
        hmac_hash = hmac.new(
            self.byte_secret(),
            self.int_to_bytestring(input),
            self.digest,
        ).digest()

        hmac_hash = bytearray(hmac_hash)
        offset = hmac_hash[19] & 0xf
        code = (
            (hmac_hash[offset] & 0x7f) << 24 |
            (hmac_hash[offset + 1] & 0xff) << 16 |
            (hmac_hash[offset + 2] & 0xff) << 8 |
            (hmac_hash[offset + 3] & 0xff))
        return code % 10 ** self.digits

    def byte_secret(self):
        return base64.b32decode(self.secret, casefold=True)

    def int_to_bytestring(self, int, padding=8):
        result = bytearray()
        while int != 0:
            result.append(int & 0xFF)
            int = int >> 8
        return bytearray(reversed(result)).rjust(padding, b'\0')


class HOTP(OTP):
    def at(self, count):
        return self.generate_otp(count)

    def verify(self, otp, counter):
        return strings_equal(str(otp), str(self.at(counter)))

    def provisioning_uri(self, name, initial_count=0, issuer_name=None):
        return build_uri(
            self.secret,
            name,
            initial_count=initial_count,
            issuer_name=issuer_name,
        )


class TOTP(OTP):
    def __init__(self, *args, **kwargs):
        self.interval = kwargs.pop('interval', 30)
        super(TOTP, self).__init__(*args, **kwargs)

    def at(self, for_time):
        if not isinstance(for_time, datetime.datetime):
            for_time = datetime.datetime.fromtimestamp(int(for_time))
        return self.generate_otp(self.timecode(for_time))

    def now(self):
        return self.generate_otp(self.timecode(datetime.datetime.now()))

    def verify(self, otp, for_time=None):
        if for_time is None:
            for_time = datetime.datetime.now()

        return strings_equal(str(otp), str(self.at(for_time)))

    def provisioning_uri(self, name, issuer_name=None):
        return build_uri(self.secret, name, issuer_name=issuer_name)

    def timecode(self, for_time):
        i = time.mktime(for_time.timetuple())
        return int(i / self.interval)

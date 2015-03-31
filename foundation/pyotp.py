
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
    """
    Returns the provisioning URI for the OTP; works for either TOTP or HOTP.

    This can then be encoded in a QR Code and used to provision the Google
    Authenticator app.

    For module-internal use.

    See also:
        http://code.google.com/p/google-authenticator/wiki/KeyUriFormat

    @param [String] the hotp/totp secret used to generate the URI
    @param [String] name of the account
    @param [Integer] initial_count starting counter value, defaults to None.
        If none, the OTP type will be assumed as TOTP.
    @param [String] the name of the OTP issuer; this will be the
        organization title of the OTP entry in Authenticator
    @return [String] provisioning uri
    """
    # initial_count may be 0 as a valid param
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
    """
    Timing-attack resistant string comparison.

    Normal comparison using == will short-circuit on the first mismatching
    character. This avoids that by scanning the whole string, though we
    still reveal to a timing attack whether the strings are the same
    length.
    """
    try:
        # Python 3.3+ and 2.7.7+ include a timing-attack-resistant
        # comparison function, which is probably more reliable than ours.
        # Use it if available.
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
        """
        @param [String] secret in the form of base32
        @option options digits [Integer] (6)
            Number of integers in the OTP
            Google Authenticate only supports 6 currently
        @option options digest [Callable] (hashlib.sha1)
            Digest used in the HMAC
            Google Authenticate only supports 'sha1' currently
        @returns [OTP] OTP instantiation
        """
        self.digits = digits
        self.digest = digest
        self.secret = s

    def generate_otp(self, input):
        """
        @param [Integer] input the number used seed the HMAC
        Usually either the counter, or the computed integer
        based on the Unix timestamp
        """
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
        """
        Turns an integer to the OATH specified
        bytestring, which is fed to the HMAC
        along with the secret
        """
        result = bytearray()
        while int != 0:
            result.append(int & 0xFF)
            int = int >> 8
        return bytearray(reversed(result)).rjust(padding, b'\0')


class HOTP(OTP):
    def at(self, count):
        """
        Generates the OTP for the given count
        @param [Integer] count counter
        @returns [Integer] OTP
        """
        return self.generate_otp(count)

    def verify(self, otp, counter):
        """
        Verifies the OTP passed in against the current time OTP
        @param [String/Integer] otp the OTP to check against
        @param [Integer] counter the counter of the OTP
        """
        return strings_equal(str(otp), str(self.at(counter)))

    def provisioning_uri(self, name, initial_count=0, issuer_name=None):
        """
        Returns the provisioning URI for the OTP
        This can then be encoded in a QR Code and used
        to provision the Google Authenticator app
        @param [String] name of the account
        @param [Integer] initial_count starting counter value, defaults to 0
        @param [String] the name of the OTP issuer; this will be the
            organization title of the OTP entry in Authenticator
        @return [String] provisioning uri
        """
        return build_uri(
            self.secret,
            name,
            initial_count=initial_count,
            issuer_name=issuer_name,
        )


class TOTP(OTP):
    def __init__(self, *args, **kwargs):
        """
        @option options [Integer] interval (30) the time interval in seconds
            for OTP This defaults to 30 which is standard.
        """
        self.interval = kwargs.pop('interval', 30)
        super(TOTP, self).__init__(*args, **kwargs)

    def at(self, for_time):
        """
        Accepts either a Unix timestamp integer or a Time object.
        Time objects will be adjusted to UTC automatically
        @param [Time/Integer] time the time to generate an OTP for
        """
        if not isinstance(for_time, datetime.datetime):
            for_time = datetime.datetime.fromtimestamp(int(for_time))
        return self.generate_otp(self.timecode(for_time))

    def now(self):
        """
        Generate the current time OTP
        @return [Integer] the OTP as an integer
        """
        return self.generate_otp(self.timecode(datetime.datetime.now()))

    def verify(self, otp, for_time=None):
        """
        Verifies the OTP passed in against the current time OTP
        @param [String/Integer] otp the OTP to check against
        """
        if for_time is None:
            for_time = datetime.datetime.now()

        return strings_equal(str(otp), str(self.at(for_time)))

    def provisioning_uri(self, name, issuer_name=None):
        """
        Returns the provisioning URI for the OTP
        This can then be encoded in a QR Code and used
        to provision the Google Authenticator app
        @param [String] name of the account
        @return [String] provisioning uri
        """
        return build_uri(self.secret, name, issuer_name=issuer_name)

    def timecode(self, for_time):
        i = time.mktime(for_time.timetuple())
        return int(i / self.interval)

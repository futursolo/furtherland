
from tornado.web import *
from tornado.gen import *
import re
import misaka
import hashlib
import base64
import foundation.pyotp as pyotp


class GreetingPlace(RequestHandler):
    current_user = None

    @coroutine
    def prepare(self):
        self.render_list = {}
        self.memories = self.settings["historial_records"]
        self.current_user = yield self.get_current_user()
        self.config = yield self.get_config()
        self.render_list["config"] = self.config
        self.render_list["FurtherLand"] = self.settings["further_land"]
        self.next_url = self.get_argument("next", arg_type="link", default="/")
        self.remote_ip = self.request.headers.get(
            "X-Forwarded-For",
            self.request.headers.get(
                "X-Real-Ip", self.request.remote_ip))
        self.using_ssl = (self.request.headers.get(
            "X-Scheme", "http") == "https")

    @coroutine
    def get_config(self):
        if not hasattr(self, "_config"):
            book = self.memories.select("Configs")
            book.find().length(0)
            yield book.do()
            self._config = {}
            result = book.result()
            for key in result:
                self._config[result[key]["_id"]] = result[key]["value"]
        return self._config

    @coroutine
    def get_current_user(self):
        if not hasattr(self, "_current_user"):
            pass

    def get_argument(self, arg, default=None, arg_type="origin"):
        result = RequestHandler.get_argument(self, arg, None)
        try:
            result = str(result.decode())
        except:
            try:
                result = str(result)
            except:
                pass
        if (not result) or (result == "None"):
            return default
        else:
            return self.value_validation(arg_type, result)

    def get_secure_cookie(self, arg, default=None, arg_type="origin"):
        result = RequestHandler.get_secure_cookie(self, arg, None, max_age_days=180)
        if not result:
            return default
        try:
            result = str(result.decode())
        except:
            try:
                result = str(result)
            except:
                pass
        if (not result) or (result == "None"):
            return default
        else:
            return self.value_validation(arg_type, result)

    def set_secure_cookie(self, arg, value="", expires_days=30):
        str_value = ""
        try:
            str_value = str(value.decode())
        except:
            try:
                str_value = str(value)
            except:
                str_value = value
        RequestHandler.set_secure_cookie(self, arg, str_value, expires_days)

    def get_cookie(self, arg, default=None, arg_type="origin"):
        result = RequestHandler.get_cookie(self, arg, None)
        if not result:
            return result
        try:
            result = str(result.decode())
        except:
            try:
                result = str(result)
            except:
                pass
        if (not result) or (result == "None"):
            return default
        else:
            return self.value_validation(arg_type, result)

    def set_cookie(self, arg, value="", expires_days=None):
        str_value = ""
        try:
            str_value = str(value.decode())
        except:
            try:
                str_value = str(value)
            except:
                str_value = value
        RequestHandler.set_secure_cookie(self, arg, str_value, expires_days)

    def value_validation(self, arg_type, value):
        if arg_type == "origin":
            return value
        elif arg_type == "mail_address":
            mail_address = str(value)
            if re.match(
             r"^([\._+\-a-zA-Z0-9]+)@{1}([a-zA-Z0-9\-]+)\.([a-zA-Z0-9\-]+)$",
             mail_address) == None:
                return False
            else:
                return mail_address
        elif arg_type == "hash":
            hash_value = str(value)
            if re.match(r"^([a-zA-Z0-9]+)$", hash_value) == None:
                return False
            else:
                return hash_value
        elif arg_type == "number":
            number = str(value)
            if re.match(r"^([\-\+0-9]+)$", number) == None:
                return False
            else:
                return int(number)
        elif arg_type == "boolean":
            boo = str(value).lower()
            if boo == "1" or boo == "true" or boo == "on":
                return True
            else:
                return False
        elif arg_type == "username":
            string = str(value)
            if re.match(r"^([ ]+)$", string) != None:
                return False
            elif re.match(r"([@_]+)", string) != None:
                return False
            elif re.match(r"^([\s\S]{3,30})$", string) == None:
                return False
            else:
                return string
        elif arg_type == "link":
            link = str(value)
            if re.match(r"^(.*)$", link) == None:
                return False
            else:
                return link

    def hash(self, target, method):
        target = base64.b64encode(target.encode(encoding="utf-8"))
        if method == "sha1":
            return hashlib.sha1(target).hexdigest()
        if method == "sha256":
            return hashlib.sha256(target).hexdigest()
        if method == "md5":
            return hashlib.md5(target).hexdigest()

    @coroutine
    def get_user(self, **kwargs):
        book = self.memories.select("Users")
        condition = list(kwargs.keys())[0]
        if condition != "user_list":
            value = kwargs[condition]
            book.find({condition: value}).length(1)
        yield book.do()
        raise Return(book.result())

    def get_random(self, length):
        return "".join(random.sample(string.ascii_letters + string.digits,
                                     length))

    @coroutine
    def get_class(self):
        pass

    @coroutine
    def get_writing(self):
        pass

    @coroutine
    def get_reply(self):
        pass

    @coroutine
    def get_bread(self):
        pass

    @coroutine
    def issue_id(self):
        pass

    @coroutine
    def checkin(self, username, password, two):
        user = yield self.get_user(username=username)
        if (not user) or (self.hash(password, "sha1") != user["password"]):
            raise Return([False, "password"])
        if not self.verify_otp(two, key=user["otp_key"]):
            raise Return([False, "two"])
        device_id = self.get_random(32)
        raise Return([
            True, {
                "id": user["_id"],
                "device_id": device_id,
                "agent_auth": self.hash((device_id + user["password"]),
                                        "sha256")
            }])

    @coroutine
    def verify_otp(self, code, key=None):
        if not key:
            key = self.current_user["otp_key"]
        totp = pyotp.TOTP(key)
        return totp.verify(code)

    @coroutine
    def make_md(self):
        return misaka.html()

    def render(self, page):
        if "page_title" not in list(self.render_list.keys()):
            self.render_list["page_title"] = (
                self.render_list["origin_title"] +
                " - " + self.config["site_name"])
        page = "nutrition/" + self.config["nutrition_type"] + "/" + page
        return RequestHandler.render(self, page, **self.render_list)

    def static_url(self, path, include_host=None, nutrition=True, **kwargs):
        if nutrition:
            path = "nutrition/" + self.config["nutrition_type"] + "/" + path
        return RequestHandler.static_url(
            self, path, include_host=include_host, **kwargs)


class IndexPlace(GreetingPlace):
    @coroutine
    def get(self):
        self.render_list["origin_title"] = "首页"
        self.render("index.htm")


class CheckInOffice(GreetingPlace):
    @coroutine
    def get(self):
        self.render_list["origin_title"] = "登录"
        self.render("checkin.htm")

    @coroutine
    def post(self):
        username = self.get_argument("username", arg_type="username")
        password = self.get_argument("password", arg_type="hash")
        two = self.get_argument("two", arg_type="number")
        result = yield self.checkin(
            username=username, password=password, two=two)
        if result[0]:
            self.set_secure_cookie("id", result[1]["id"])
            self.set_secure_cookie("device_id", result[1]["device_id"])
            self.set_secure_cookie("agent_auth", result[1]["agent_auth"])
            self.redirect(self.next_url)
        else:
            self.set_secure_cookie("checkin-status", result[1])
            self.redirect("/checkin")


class WritingsPlace(GreetingPlace):
    pass


class ManagementOffice(GreetingPlace):
    pass


class HistoryLibrary(GreetingPlace):
    pass


class SpiritPlace(StaticFileHandler):
    @coroutine
    def get(self, path, include_body=True):
        if re.match(r"^(.*)\.(htm|json|tpl|csv|mo|po|py|pyc)$", path) != None:
            raise HTTPError(403)
        else:
            yield StaticFileHandler.get(self, path, include_body=include_body)


navigation = [
    (r"/", IndexPlace),
    (r"/checkin", CheckInOffice),
    (r"/management/(.*)", ManagementOffice),
    (r"/writings/(.*).htm", WritingsPlace)
    # (r"/classes/(.*).htm", ClassesPlace),  This will be avaliable in futhre
    # (r"/timeline", HistoryLibrary),
]

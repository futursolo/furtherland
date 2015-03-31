
from tornado.web import *
from tornado.gen import *
import re
import misaka
import hashlib
import base64
import foundation.pyotp as pyotp
import random
import string
import functools


def visitor_only(func):
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        if self.current_user:
            self.redirect(self.next_url)
            return
        return func(self, *args, **kwargs)
    return wrapper


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
        self.render_list["checkin_status"] = self.checkin_status
        self.render_list["management_url"] = self.management_url

        self.next_url = self.get_arg("next", arg_type="link", default="/")
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
        raise Return(self._config)


    @coroutine
    def get_current_user(self):
        if not hasattr(self, "_current_user"):
            user_id = self.get_scookie("user_id", arg_type="number")
            device_id = self.get_scookie("device_id", arg_type="hash")
            agent_auth = self.get_scookie("agent_auth", arg_type="hash")
            if not (user_id and device_id and agent_auth):
                self._current_user = None
            else:
                user = yield self.get_user(_id=user_id)
                if self.hash((device_id + user["password"]),
                             "sha256") != agent_auth:
                    self._current_user = None
                else:
                    self._current_user = user
            raise Return(self._current_user)

    def get_arg(self, arg, default=None, arg_type="origin"):
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

    def get_scookie(self, arg, default=None, arg_type="origin"):
        result = RequestHandler.get_secure_cookie(
            self, arg, None, max_age_days=181)
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

    def set_scookie(self, arg, value="", expires_days=30):
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
            if re.match(r"^([ a-zA-Z]+)$", string) == None:
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

    def checkin_status(self, code=None):
        if not hasattr(self, ("_checkin_status")):
            self._checkin_status = self.get_scookie(
                "checkin_status", arg_type="hash", default="ok")
            self.clear_cookie("checkin_status")
        if code is None:
            return (self._checkin_status != "ok")
        return (code == self._checkin_status)

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
        if not (self.verify_otp(two, key=user["otp_key"])):
            raise Return([False, "two"])
        device_id = self.get_random(32)
        raise Return([
            True, {
                "user_id": user["_id"],
                "device_id": device_id,
                "agent_auth": self.hash((device_id + user["password"]),
                                        "sha256")
            }])

    def verify_otp(self, code, key=None):
        if not key:
            key = self.current_user["otp_key"]
        totp = pyotp.TOTP(key)
        return totp.verify(code)

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

    def management_render(self, page):
        if "page_title" not in list(self.render_list.keys()):
            self.render_list["page_title"] = (
                self.render_list["origin_title"] +
                " - " + self.config["site_name"] + "管理局")
        page = "management/" + page
        return RequestHandler.render(self, page, **self.render_list)

    def management_url(self, path, include_host=None, **kwargs):
        path = "management/" + path
        return RequestHandler.static_url(
            self, path, include_host=include_host, **kwargs)


class IndexPlace(GreetingPlace):
    @coroutine
    def get(self):
        self.render_list["origin_title"] = "首页"
        self.render("index.htm")


class WritingsPlace(GreetingPlace):
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


class CheckinOffice(GreetingPlace):
    @coroutine
    @visitor_only
    def get(self):
        self.render_list["origin_title"] = "登录"
        self.management_render("checkin.htm")

    @coroutine
    @visitor_only
    def post(self):
        username = self.get_arg("username", arg_type="username")
        password = self.get_arg("password", arg_type="hash")
        two = self.get_arg("two", arg_type="number")
        remember = self.get_arg("remember", arg_type="boolean")
        if not (username and password and two):
            self.set_scookie("checkin_status", "password", expires_days=None)
            self.redirect("/management/checkin")
            return
        result = yield self.checkin(
            username=username, password=password, two=two)
        if result[0]:
            expires_days = None
            if remember:
                expires_days = 180
            self.set_scookie(
                "user_id", result[1]["user_id"],
                expires_days=expires_days)
            self.set_scookie(
                "device_id", result[1]["device_id"],
                expires_days=expires_days)
            self.set_scookie(
                "agent_auth", result[1]["agent_auth"],
                expires_days=expires_days)
            self.redirect(self.next_url)
        else:
            self.set_scookie("checkin_status", result[1], expires_days=None)
            self.redirect("/management/checkin")


class CheckoutOffice(GreetingPlace):
    def get(self):
        self.clear_cookie("user_id")
        self.clear_cookie("device_id")
        self.clear_cookie("agent_auth")
        self.redirect(self.next_url)


class LobbyOffice(GreetingPlace):
    @coroutine
    @authenticated
    def get(self):
        self.render_list["origin_title"] = "大厅"
        self.management_render("lobby.htm")

    @coroutine
    @authenticated
    def post(self):
        pass


navigation = [
    (r"/", IndexPlace),
    # (r"/classes/(.*).htm", ClassesPlace),  This will be avaliable in futhre
    # (r"/timeline", HistoryLibrary),
    (r"/writings/(.*).htm", WritingsPlace),
    (r"/management/checkin", CheckinOffice),
    (r"/management/checkout", CheckoutOffice),
    (r"/management", RedirectHandler, {"url": "/management/lobby"}),
    (r"/management/", RedirectHandler, {"url": "/management/lobby"}),
    (r"/management/lobby", LobbyOffice)
]

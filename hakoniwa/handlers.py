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

from typing import Optional, Dict, Union, ClassVar, List, Coroutine, \
    Callable, Any, TypeVar, Type

from .utils import lazy_property, Json
from .httputils import format_timestamp, HttpCookies

from . import requests
from . import constants
from . import exceptions
from . import responses
from . import security

import asyncio
import magicdict
import html
import traceback
import functools
import typing
import os
import mimetypes
import datetime
import base64
import email.utils
import time
import hmac
import urllib.parse
import json

if typing.TYPE_CHECKING:
    from . import web

__all__ = [
    "draw_sketch", "with_methods", "BaseRequestHandler", "RequestHandler",
    "StaticFileHandler"]


_DEFAULT_ERROR_TPL = """
<!DOCTYPE HTML>
<html>
<head>
    <meta charset="utf-8">
    <title>HTTP {status_code}: {status_code_description}</title>
</head>
<body>
    <div>
        <pre>HTTP {status_code}: {status_code_description}

{content}</pre>
    </div>
</body>
</html>
""".strip()

_DEFAULT_REDIRECT_TPL = """
<!DOCTYPE HTML>
<html>
<head>
    <meta charset="utf-8">
    <title>HTTP {status_code} {status_code_description}</title>
</head>
<body>
    <h1>HTTP {status_code} {status_code_description}</h1>
    The document has moved <a href="{url}">here</a>.
</body>
</html>
""".strip()


class _Identifier:
    pass


_RAISE_ERROR = _Identifier()
_DEFAULT_LENGTH = _Identifier()

_SktFn = Callable[..., Coroutine[Any, Any, Dict[str, Any]]]
_MethodFn = Callable[..., Coroutine[Any, Any, None]]


def draw_sketch(sketch_name: str) -> Callable[[_SktFn], _MethodFn]:
    """
    Decorator to render sketches.

    Only effective when nothing is written.

    Example:

    .. code-block:: python3

      @draw_sketch("index.htm")
      async def get(self, *args, **kwargs):
          return {'content': 'Hello, World!!'}

    """
    def decorator(f: _SktFn) -> _MethodFn:
        @functools.wraps(f)
        async def wrapper(self: "BaseRequestHandler", **kwargs: str) -> None:
            sketch_kwargs = await f(self, **kwargs)
            if self._body_buf or self._response:
                return

            await self.draw(sketch_name, **sketch_kwargs)
        return wrapper
    return decorator


_THandler = TypeVar("_THandler", bound=Type["BaseRequestHandler"])


def with_methods(*args: Union[constants.HttpRequestMethod]) -> \
        Callable[[_THandler], _THandler]:
    """
    Set methods that should be allowed. Anything else
    will be responded with :code:`HTTP 405(Method Not Allowed)`.
    """
    def decorator(cls: _THandler) -> _THandler:
        @functools.wraps(cls)
        class Wrapper(cls):  # type: ignore
            _ALLOWED_METHODS = [constants.HttpRequestMethod(i) for i in args]

        return typing.cast(_THandler, Wrapper)
    return decorator


class BaseRequestHandler:
    _ALLOWED_METHODS: ClassVar[List[constants.HttpRequestMethod]] = [
        constants.HttpRequestMethod.GET,
        constants.HttpRequestMethod.HEAD,
        constants.HttpRequestMethod.POST,
        constants.HttpRequestMethod.DELETE,
        constants.HttpRequestMethod.PATCH,
        constants.HttpRequestMethod.OPTIONS,
        constants.HttpRequestMethod.PUT
    ]

    def __init__(
        self, app: "web.Application", request: requests.Request,
        path_kwargs: Optional[Dict[str, str]] = None
    ) -> None:
        self.app = app
        self.request = request
        self.path_kwargs = path_kwargs or {}

        self._status_code = constants.HttpStatusCode.OK
        self._headers: magicdict.TolerantMagicDict[str, str] = \
            magicdict.TolerantMagicDict()
        self._cookies: "HttpCookies[str]" = HttpCookies()
        self._body_buf = bytearray()

        self._response: Optional[responses.Response] = None

        self.set_header("content-type", "text/html; charset=utf-8;")

    def set_status_code(
            self, status_code: Union[constants.HttpStatusCode, int]) -> None:
        if self._response:
            raise exceptions.HttpError(
                500, "You cannot set status code after "
                "the response has been created.")

        if status_code >= 400:
            self.set_header("Connection", "Close")

        self._status_code = constants.HttpStatusCode(status_code)

    def get_header(
            self, name: str, default: Optional[str] = None) -> str:
        """
        Return First Header with the name.

        :arg name: the name of the header.
        :arg default: the default value if no value is found. If the default
          value is not specified or is :code:`None`,
          then the header is required,
          it will raise an error if the header cannot be found.
        """
        try:
            return self.request.headers[name]

        except KeyError:
            if default is not None:
                return default

            raise

    def get_all_headers(self, name: str) -> List[str]:
        """
        Return all headers with the name.

        If the header cannot be found, it will return an empty list.
        """
        return self.request.headers.get_list(name)

    def set_header(self, name: str, value: str) -> None:
        """
        Set a response header with the name and value, this will override any
        existing value(s) with the same name.
        """
        if self._response:
            raise exceptions.HttpError(
                500, "You cannot set a new header after "
                "the response has been created.")
        self._headers[name] = value

    def add_header(self, name: str, value: str) -> None:
        """
        Add a response header with the name and value, this will not override
        any former value(s) with the same name.
        """
        if self._response:
            raise exceptions.HttpError(
                500, "You cannot set a new header after "
                "the response has been created.")
        self._headers.add(name, value)

    def clear_header(self, name: str) -> None:
        """
        Clear response header(s) with the name.
        """
        if self._response:
            raise exceptions.HttpError(
                500, "You cannot set a new header after "
                "the response has been created.")
        if name in self._headers.keys():
            del self._headers[name]

    def clear_all_headers(self) -> None:
        """
        Clear all response header(s).
        """
        if self._response:
            raise exceptions.HttpError(
                500, "You cannot set a new header after "
                "the response has been created.")
        self._headers = magicdict.TolerantMagicDict()

    def _bytes_to_http_safe_str(self, b: bytes) -> str:
        return base64.b85encode(b).decode("ascii").replace(";", ".")

    def _http_safe_str_to_bytes(self, s: str) -> bytes:
        return base64.b85decode(s.replace(".", ";").encode("ascii"))

    def _decode_safe_cookie(self, s: str) -> str:
        if not self.app._safe_cookies:
            return s

        if s[0] == "/":
            return s[1:]

        return self._http_safe_str_to_bytes(s).decode("utf-8")

    def _encode_safe_cookie(self, s: str) -> str:
        if not self.app._safe_cookies:
            return s

        try:
            s.encode("ascii")

        except UnicodeEncodeError:
            return self._bytes_to_http_safe_str(s.encode("utf-8"))

        else:
            return "/" + s

    def _get_cookie(self, name: str) -> str:
        cookie = self.request.cookies.get(name, None)
        if cookie is None:
            raise KeyError(name)

        return cookie.value

    def get_cookie(
        self, name: str,
            default: Union[str, _Identifier] = _RAISE_ERROR) -> str:
        """
        Return first Cookie in the request header(s) with the name.

        If the cookie is expired or doesn't exist, it will return the default
        value.
        """
        try:
            return self._decode_safe_cookie(self._get_cookie(name))

        except (KeyError, UnicodeDecodeError):
            if default is _RAISE_ERROR:
                raise

            return default  # type: ignore

    def get_binary_cookie(
        self, name: str,
            default: Union[bytes, _Identifier] = _RAISE_ERROR) -> bytes:
        """
        Return first Cookie in the request header(s) with the name.

        If the cookie is expired or doesn't exist, it will return the default
        value.
        """
        try:
            return self._http_safe_str_to_bytes(self._get_cookie(name))

        except (KeyError, UnicodeDecodeError):
            if default is _RAISE_ERROR:
                raise

            return default  # type: ignore

    def _set_cookie(
        self, name: str, value: str, *, domain: Optional[str],
        expires: Optional[datetime.datetime], path: Optional[str],
        secure: bool, httponly: bool,
            max_age: Optional[datetime.timedelta]) -> None:
        if self._response:
            raise exceptions.HttpError(
                500, "You cannot set a new cookie after "
                "the response has been created.")
        self._cookies[name] = value

        if domain is not None:
            self._cookies[name]["domain"] = domain

        if expires is not None:
            self._cookies[name]["expires"] = format_timestamp(expires)

        if path is not None:
            self._cookies[name]["path"] = path

        if max_age is not None:
            self._cookies[name]["max-age"] = str(int(max_age.total_seconds()))

        if secure:
            self._cookies[name]["secure"] = "true"

        if httponly:
            self._cookies[name]["httponly"] = "true"

    def set_cookie(
        self, name: str, value: str, *, domain: Optional[str] = None,
        expires: Optional[datetime.datetime] = None,
        path: Optional[str] = None, secure: bool = False,
        httponly: bool = False,
            max_age: Optional[datetime.timedelta] = None) -> None:
        """
        Set a cookie with attribute(s).

        :arg name: is the name of the cookie.
        :arg value: is the value of the cookie.
        :arg domain: is the domain of the cookie.
        :arg path: is the path of the cookie.
        :arg expires_days: is the lifetime of the cookie.
        :arg secure: is the property if the cookie can only be passed via
            https.
        :arg httponly: is the property if the cookie can only be passed by
            http.
        """
        self._set_cookie(
            name, self._encode_safe_cookie(value), domain=domain,
            expires=expires, path=path, secure=secure, httponly=httponly,
            max_age=max_age)

    def set_binary_cookie(
        self, name: str, value: bytes, *, domain: Optional[str] = None,
        expires: Optional[datetime.datetime] = None,
        path: Optional[str] = None, secure: bool = False,
        httponly: bool = False,
            max_age: Optional[datetime.timedelta] = None) -> None:
        """
        Set a cookie with attribute(s).

        :arg name: is the name of the cookie.
        :arg value: is the value of the cookie.
        :arg domain: is the domain of the cookie.
        :arg path: is the path of the cookie.
        :arg expires_days: is the lifetime of the cookie.
        :arg secure: is the property if the cookie can only be passed via
            https.
        :arg httponly: is the property if the cookie can only be passed by
            http.
        """
        self._set_cookie(
            name, self._bytes_to_http_safe_str(value), domain=domain,
            expires=expires, path=path, secure=secure, httponly=httponly,
            max_age=max_age)

    def clear_cookie(self, name: str) -> None:
        """
        Clear a cookie with the name.
        """
        if self._response:
            raise exceptions.HttpError(
                500, "You cannot clear a cookie after "
                "the response has been created.")
        self.set_cookie(
            name=name, value="", expires=datetime.datetime.utcfromtimestamp(0))

    def clear_all_cookies(self) -> None:
        """
        Clear response cookie(s).
        """
        if self._response:
            raise exceptions.HttpError(
                500, "You cannot clear cookies after "
                "the response has been created.")
        for cookie_name in self.request.cookies.keys():
            self.clear_cookie(cookie_name)

    def get_secure_binary_cookie(
        self, name: str,
        max_age: Optional[datetime.timedelta] = None,
            default: Union[bytes, _Identifier] = _RAISE_ERROR) -> bytes:
        """
        Get a secure cookie with the name, if it is valid, or None.

        :arg name: is the name of the secure cookie.
        :max_age_days: is the valid length of the secure cookie, it you want it
            always be valid, please set it to None.
        :arg default: is the default value if the cookie is invalid.
        """
        if self.app._sec_ctx is None:
            raise ValueError(
                "Cannot find security context. "
                "Please provide security_secret.")

        if max_age is None:
            max_age = self.app._secure_cookie_max_age

        try:
            cookie_buf = self.get_binary_cookie(name)

            return self.app._sec_ctx.lookup_origin_data(
                cookie_buf, max_age=max_age)

        except (KeyError, ValueError, TimeoutError, UnicodeDecodeError):
            if default is not _RAISE_ERROR:
                return default  # type: ignore

            raise

    def set_secure_binary_cookie(
        self, name: str, value: bytes, *, domain: Optional[str] = None,
        expires: Optional[datetime.datetime] = None,
        path: Optional[str] = None, secure: bool = False,
        httponly: bool = False,
        max_age: Optional[Union[datetime.timedelta, _Identifier]] =
            _DEFAULT_LENGTH) -> None:
        """
        Set a secure cookie in bytes.

        This allows you to store arbitrary in cookie field with a signed
        signature.

        Use of this method is not recommended, you should try other ways
        and keep this as a last resort.

        You must set a security_secret in Application Settings before
        you use this method. It can be generated by::

          hakoniwa.security.get_random_str(length=32)

        Once security_secret is generated, treat it like a password,
        change security_secret will cause all secure_cookie become invalid.

        :arg name: is the name of the secure cookie.
        :arg value: is the value of the secure cookie.
        :arg expires_days: is the lifetime of the cookie.
        :arg \\*\\*kwargs: all the other keyword arguments will be passed to
            ``RequestHandler.set_cookie``.
        """
        if self.app._sec_ctx is None:
            raise ValueError(
                "Cannot find security context. "
                "Please provide security_secret.")

        if expires is None and max_age is _DEFAULT_LENGTH:
            max_age = self.app._secure_cookie_max_age

        content_buf = self.app._sec_ctx.generate_secure_data(value)
        self.set_binary_cookie(
            name, content_buf, domain=domain,
            expires=expires, path=path, secure=secure, httponly=httponly,
            max_age=max_age)  # type: ignore

    def set_secure_cookie(
        self, name: str, value: str, *, domain: Optional[str] = None,
        expires: Optional[datetime.datetime] = None,
        path: Optional[str] = None, secure: bool = False,
        httponly: bool = False,
        max_age: Optional[Union[datetime.timedelta, _Identifier]] =
            _DEFAULT_LENGTH) -> None:
        """
        Set a secure cookie in bytes.

        This allows you to store arbitrary in cookie field with a signed
        signature.

        You must set a security_secret in Application Settings before
        you use this method. It can be generated by::

          hakoniwa.security.get_random_str(length=32)

        Once security_secret is generated, treat it like a password,
        change security_secret will cause all secure_cookie become invalid.

        :arg name: is the name of the secure cookie.
        :arg value: is the value of the secure cookie.
        :arg expires_days: is the lifetime of the cookie.
        :arg \\*\\*kwargs: all the other keyword arguments will be passed to
            ``RequestHandler.set_cookie``.
        """
        self.set_secure_binary_cookie(
            name, value.encode("utf-8"), domain=domain,
            expires=expires, path=path, secure=secure, httponly=httponly,
            max_age=max_age)

    def get_secure_cookie(
        self, name: str,
        max_age: Optional[datetime.timedelta] = None,
            default: Union[str, _Identifier] = _RAISE_ERROR) -> str:
        """
        Get a secure cookie with the name, if it is valid, or None.

        :arg name: is the name of the secure cookie.
        :max_age_days: is the valid length of the secure cookie, it you want it
            always be valid, please set it to None.
        :arg default: is the default value if the cookie is invalid.
        """
        try:
            cookie_buf = self.get_secure_binary_cookie(name, max_age=max_age)

            return cookie_buf.decode("utf-8")

        except (KeyError, ValueError, TimeoutError, UnicodeDecodeError):
            if default is not _RAISE_ERROR:
                return default  # type: ignore

            raise

    def get_query(
        self, name: str,
            default: Union[str, _Identifier] = _RAISE_ERROR) -> str:
        """
        Return first argument in the link with the name.

        :arg name: the name of the argument.
        :arg default: the default value if no value is found. If the default
            value is not specified, it means that the argument is required, it
            will produce an error if the argument cannot be found.
        """
        try:
            return self.request.queries[name]

        except KeyError:
            if default is _RAISE_ERROR:
                raise

            return default  # type: ignore

    def get_all_queries(self, name: str) -> List[str]:
        """
        Return all link args with the name by list.

        If the arg cannot be found, it will return an empty list.
        """
        return self.request.queries.get_list(name)

    async def _process_body(self) -> None:
        pass

    async def _write_response(self) -> None:
        if self._response:
            raise exceptions.HttpError(
                500, "You cannot write response twice.")

        if self.request.version == constants.HttpVersion.V1_1 and \
            "transfer-encoding" not in self._headers.keys() and \
                "content-length" not in self._headers.keys():
            self.set_header("transfer-encoding", "Chunked")

        if "date" not in self._headers.keys():
            self.set_header("date", format_timestamp())

        for cookie_morsel in self._cookies.values():
            self._headers.add("set-cookie", cookie_morsel.OutputString())

        self._response = await self.request.write_response(
            self._status_code,
            headers=self._headers)

        await self._response.write(bytes(self._body_buf))
        self._body_buf.clear()

    async def write(
            self, data: Union[bytes, str], clear_buf: bool = False) -> None:
        """
        Write response body.

        If :code:`write()` is called more than once, it will combine all parts
        together.

        If you use :code:`write()`, then you must return :code:`None`.
        """
        if isinstance(data, str):
            data = data.encode()

        if not self._response:
            if clear_buf:
                self._body_buf.clear()

            self._body_buf += data

            return

        if clear_buf:
            raise exceptions.HttpError(
                constants.HttpStatusCode.INTERNAL_SERVER_ERROR,
                "You cannot clear the body buffer after "
                "the response has been created")

        await self._response.write(data)

    async def redirect(
        self, url: str, permanent: bool = False,
        status_code: Optional[
            Union[int, constants.HttpStatusCode]] = None) -> None:
        """
        Rediect request to other location.

        :arg url: is the relative url or absolute url that the client will be
            redirected to.
        :arg permanent: True if this is 301 else 302.
        :arg status_code: Custom the status code.
        """
        if self._response or self._body_buf:
            raise exceptions.HttpError(
                constants.HttpStatusCode.INTERNAL_SERVER_ERROR,
                "You cannot redirect pages after a response has been created.")

        if status_code is None:
            final_status_code = constants.HttpStatusCode.MOVED_PERMANENTLY \
                if permanent else constants.HttpStatusCode.FOUND

        else:
            assert 300 <= status_code <= 399
            final_status_code = constants.HttpStatusCode(status_code)

        self.set_status_code(final_status_code)
        self.set_header("location", url)
        await self.write(_DEFAULT_REDIRECT_TPL.format(
            status_code=int(final_status_code),
            status_code_description=final_status_code.phrase,
            url=url))

    async def flush(self) -> None:
        """
        Flush the response and body buffer to remote.

        Use of this method is not recommended unless your response is very big
        as this disables error pages and can only be used on
        :code:`WritableResponse`s.
        """
        if self._response is None:
            await self._write_response()

        if not isinstance(self._response, responses.WritableResponse):
            raise exceptions.HttpError(
                500, "You cannot flush a non-writable response.")

        await self._response.flush()

    async def get_static_path(self, path: str) -> str:
        """
        Resolve static files into path.
        """
        return self.app.handlers.reverse("static", file=path)

    async def get_sketch_args(self) -> Dict[str, Any]:
        """
        Get the default arguments for template rendering.

        Override this function to return custom default template arguments.
        """
        return {
            "handler": self,
            "static_path": self.get_static_path
        }

    async def draw_str(self, sketch_name: str, **kwargs: Any) -> str:
        assert self.app._skt_finder is not None, \
            "Sketch finder is not initialized. "\
            "Please set `sketch_path` in application arguments and try again."

        final_args = await self.get_sketch_args()
        final_args.update(**kwargs)

        sketch = await self.app._skt_finder.find(sketch_name)
        return await sketch.draw(**final_args)  # type: ignore

    async def draw(self, sketch_name: str, **kwargs: Any) -> None:
        await self.write(await self.draw_str(sketch_name, **kwargs))

    async def before(self) -> None:
        """
        This function will be called before the corresponding handler.
        """
        pass

    async def head(self, **kwargs: str) -> Optional[Union[str, bytes]]:
        """
        Handler for HEAD requests.

        The default implementation delegates the request to `self.get()`
        and strip the body out of the response. You may wish to override this
        if you used `self.flush()` or stream reader/writer in `self.get()`.
        """
        result = await self.get(**kwargs)

        if self._status_code >= 400:
            return None

        if self._response or self._body_buf:
            raise exceptions.HttpError(
                constants.HttpStatusCode.INTERNAL_SERVER_ERROR,
                ("Body was flushed/written during the execution, "
                 "and the method didn't return `None`."))

        if result:
            await self.write(result)

        self.set_header("content-length", str(len(self._body_buf)))
        await self.write(b"", clear_buf=True)

        return None

    async def get(self, **kwargs: str) -> Optional[Union[str, bytes]]:
        """
        Handler for GET requests.
        """
        raise exceptions.HttpError(constants.HttpStatusCode.NOT_FOUND)

    async def post(self, **kwargs: str) -> Optional[Union[str, bytes]]:
        """
        Handler for POST requests.
        """
        raise exceptions.HttpError(constants.HttpStatusCode.METHOD_NOT_ALLOWED)

    async def delete(self, **kwargs: str) -> Optional[Union[str, bytes]]:
        """
        Handler for DELETE requests.
        """
        raise exceptions.HttpError(constants.HttpStatusCode.METHOD_NOT_ALLOWED)

    async def patch(self, **kwargs: str) -> Optional[Union[str, bytes]]:
        """
        Handler for PATCH requests.
        """
        raise exceptions.HttpError(constants.HttpStatusCode.METHOD_NOT_ALLOWED)

    async def put(self, **kwargs: str) -> Optional[Union[str, bytes]]:
        """
        Handler for PUT requests.
        """
        raise exceptions.HttpError(constants.HttpStatusCode.METHOD_NOT_ALLOWED)

    async def options(self, **kwargs: str) -> Optional[Union[str, bytes]]:
        """
        Handler for OPTIONS requests.
        """
        raise exceptions.HttpError(constants.HttpStatusCode.METHOD_NOT_ALLOWED)

    async def after(self) -> None:
        """
        This function will be called after the corresponding handler.
        """
        pass

    async def write_error(
        self,
        status_code: Optional[Union[int, constants.HttpStatusCode]] = None,
        e: Optional[Exception] = None,
        message: Optional[str] = None
    ) -> None:
        """
        Exception Handler.

        Overrride this if you want to customize error pages.
        """
        if self._response:
            raise exceptions.HttpError(
                constants.HttpStatusCode.INTERNAL_SERVER_ERROR,
                "You cannot write error after "
                "the response has been created.")

        status_code = constants.HttpStatusCode(status_code) \
            if status_code else constants.HttpStatusCode.INTERNAL_SERVER_ERROR

        self.set_status_code(status_code)
        self.set_header("Content-Type", "text/html; charset=utf-8")

        contents: List[str] = []

        if message:
            contents.append(html.escape(message))

        loop = asyncio.get_event_loop()
        if loop.get_debug() and e is not None:
            contents.append(html.escape("\n".join(
                traceback.format_exception(e.__class__, e, e.__traceback__))))

        await self.write(
            _DEFAULT_ERROR_TPL.format(
                status_code=int(status_code),
                status_code_description=self._status_code.phrase,
                content="\n\n".join(contents)).encode(), clear_buf=True)

    async def _on_exception(self, e: Exception) -> None:
        if self._response:
            loop = asyncio.get_event_loop()
            if loop.get_debug():
                traceback.print_exception(e.__class__, e, e.__traceback__)

            return

        # Logging.

        if isinstance(e, exceptions.HttpError):
            status_code = e.status_code
            message: Optional[str] = e._err_str

        else:
            status_code = constants.HttpStatusCode.INTERNAL_SERVER_ERROR
            message = None

        self.set_status_code(status_code)

        try:
            await self.write_error(status_code, e, message)

        except asyncio.CancelledError:
            raise

        except Exception as e2:
            traceback.print_exception(e2.__class__, e2, e2.__traceback__)

            if not self._response:
                await self.write(b"", clear_buf=True)

    async def _process_request(self) -> None:
        try:
            if self.request.method not in self._ALLOWED_METHODS:
                raise exceptions.HttpError(
                    constants.HttpStatusCode.METHOD_NOT_ALLOWED)

            await self._process_body()

            await self.before()

            result = await getattr(self, self.request.method.value.lower())(
                **self.path_kwargs)

            if result:
                if self._response or self._body_buf:
                    raise exceptions.HttpError(
                        constants.HttpStatusCode.INTERNAL_SERVER_ERROR,
                        ("Body was flushed/written during the execution, "
                         "and the method didn't return `None`."))

                await self.write(result)

            await self.after()

        except asyncio.CancelledError:
            raise

        except Exception as e:
            await self._on_exception(e)

        finally:
            if not self._response:
                if "content-length" not in self._headers.keys():
                    self.set_header("content-length", str(len(self._body_buf)))
                await self._write_response()

            assert isinstance(self._response, responses.Response)
            await self._response.finish()


class RequestHandler(BaseRequestHandler):
    def __init__(
        self, app: "web.Application", request: requests.Request,
        path_kwargs: Optional[Dict[str, str]] = None
    ) -> None:
        super().__init__(app, request, path_kwargs)
        self._body_args: Optional[
            magicdict.FrozenTolerantMagicDict[str, str]] = None

        self.body: Union[magicdict.FrozenTolerantMagicDict[str, str], Json] = \
            None

    def get_body_arg(
        self, name: str,
            default: Union[str, _Identifier] = _RAISE_ERROR) -> str:
        """
        Return first argument in the body with the name.

        :arg name: the name of the argument.
        :arg default: the default value if no value is found. If the default
            value is not specified, it means that the argument is required, it
            will produce an error if the argument cannot be found.
        """
        try:
            if self._body_args:
                return self._body_args[name]

            else:
                raise KeyError(name)

        except KeyError:
            if default is _RAISE_ERROR:
                raise

        return default  # type: ignore

    def get_all_body_args(self, name: str) -> List[str]:
        """
        Return all body args with the name by list.

        If the arg cannot be found, it will return an empty list.
        """
        if not self._body_args:
            return []

        return self._body_args.get_list(name, [])  # type: ignore

    async def verify_csrf_token(self) -> None:
        try:
            csrf_submit = self.get_header("x-csrf-token") or \
                self.get_body_arg("_csrf_token")

            if not hmac.compare_digest(self.csrf_token, csrf_submit):
                raise exceptions.HttpError(
                    constants.HttpStatusCode.FORBIDDEN)

        except (KeyError, ValueError, TimeoutError, UnicodeDecodeError) as e:
            raise exceptions.HttpError(
                constants.HttpStatusCode.FORBIDDEN) from e

    @lazy_property
    def csrf_token(self) -> str:
        try:
            csrf_token = self.get_secure_cookie(
                "_csrf_token", max_age=datetime.timedelta(days=1))

        except (KeyError, ValueError, TimeoutError, UnicodeDecodeError):
            csrf_token = security.BaseSecurityContext.get_random_str(
                16, altchars=b"-_")

            self.set_secure_cookie(
                "_csrf_token", csrf_token, httponly=True,
                max_age=datetime.timedelta(days=1))

        return csrf_token

    @property
    def csrf_form_html(self) -> str:
        """
        Return a HTML form field contains _csrf value.
        """
        return "<input type=\"hidden\" name=\"_csrf_token\" value=\"{}\">"\
            .format(self.csrf_token)

    async def get_sketch_args(self) -> Dict[str, Any]:
        args = await super().get_sketch_args()

        args["csrf_token"] = self.csrf_token
        args["csrf_form_html"] = self.csrf_form_html

        return args

    async def _process_body(self) -> None:
        if self.request.method in (constants.HttpRequestMethod.GET,
                                   constants.HttpRequestMethod.OPTIONS,
                                   constants.HttpRequestMethod.HEAD):
            try:
                await self.request.read()

            except EOFError:
                pass

            if self.app._csrf_protect:
                self.csrf_token

            return

        content_type = self.get_header("content-type", "")

        if content_type in ("application/x-www-form-urlencoded",
                            "application/x-url-encoded"):
            body_bytes = await self.request.read()
            self._body_args = magicdict.FrozenTolerantMagicDict(
                urllib.parse.parse_qsl(body_bytes.decode("utf-8")))

            self.body = self._body_args

        elif content_type.startswith("multipart/form-data"):
            raise NotImplementedError

        elif content_type == "application/json":
            body = await self.request.read()

            try:
                body_str = body.decode("utf-8")
                self.body = json.loads(body_str.strip() or "null")

            except (UnicodeDecodeError, TypeError,
                    json.decoder.JSONDecodeError) as e:
                raise exceptions.HttpError(
                    constants.HttpStatusCode.BAD_REQUEST,
                    "Cannot Decode Json.") from e

        else:
            raise exceptions.HttpError(
                constants.HttpStatusCode.BAD_REQUEST, "Unknown content-type.")

        if self.app._csrf_protect:
            await self.verify_csrf_token()


class StaticFileHandler(RequestHandler):
    static_path: Optional[str] = None
    # Modify this to set custom static path for this handler.

    max_file_size = 1024 * 1024 * 10 - 1
    # Max file size allowed to be served by StaticFileHandler, Default: 10M.

    allow_cache = True
    # Will return `Last-Modified` or `ETag` to help caching.
    cache_with_etag = False
    # Default method is `Last-Modified`. Set this to `True` to use etag.

    async def handle_static_file(self, file_uri_path: str) -> None:
        """
        Get the file from the given file path. Override this function if you
        want to customize the way to get file.
        """
        if not self.static_path:
            raise exceptions.HttpError(404)

        file_path = os.path.join(self.static_path, file_uri_path)

        if not os.path.realpath(file_path).startswith(
                os.path.realpath(self.static_path)):
            raise exceptions.HttpError(403)

        if not os.path.exists(file_path):
            raise exceptions.HttpError(404)

        if os.path.isdir(file_path):
            raise exceptions.HttpError(403)

        if self.allow_cache:
            if self.cache_with_etag:
                raise NotImplementedError("Not supported at the moment")

            modified = os.path.getmtime(file_path)

            modified_since_tuple = email.utils.parsedate(
                self.get_header("if-modified-since", ""))

            if modified_since_tuple:
                modified_since: Optional[float] = time.mktime(
                    modified_since_tuple)

            else:
                modified_since = None

            if modified_since and int(modified) == int(modified_since):
                self.set_status_code(constants.HttpStatusCode.NOT_MODIFIED)
                self.clear_header("content-type")

                return

            else:
                self.set_header("last-modified", format_timestamp(modified))
                # self.set_header("cache-control", "max-age=86400")

        file_size = os.path.getsize(file_path)
        if file_size >= self.max_file_size:
            raise exceptions.HttpError(500, "Static File Size Too Large.")

        mime = mimetypes.guess_type(file_uri_path)[0]
        mime = mime or "application/octet-stream"
        self.set_header("content-type", mime)

        with open(file_path, "rb") as f:
            await self.write(f.read())

    async def get(self, **kwargs: str) -> None:
        await self.handle_static_file(file_uri_path=kwargs["file"])

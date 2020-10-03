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

from typing import TypeVar, Generic, Any, Callable, Coroutine

import functools
import asyncio
import typing

_T = TypeVar("_T")


class FurtherlandError(Exception):
    """
    Base Exception for Furtherland.
    """
    pass


class _LazyPropertyWrapper(Generic[_T]):
    def __init__(self, func: Callable[[Any], _T]) -> None:
        self.func = func
        functools.update_wrapper(self, func)  # type: ignore

    def __get__(self, obj: Any, *args: Any, **kwargs: Any) -> _T:
        if obj is None:
            return self  # type: ignore
        val = self.func(obj)
        obj.__dict__[self.func.__name__] = val
        return val


def lazy_property(func: Callable[[Any], _T]) -> _LazyPropertyWrapper[_T]:
    """
    A Cached Property Decorator.

    References:
    https://en.wikipedia.org/wiki/Lazy_evaluation
    https://github.com/faif/python-patterns/blob/master/creational/
    lazy_evaluation.py
    """
    return _LazyPropertyWrapper(func)


_AsyncFn = TypeVar("_AsyncFn", bound=Callable[..., Coroutine[Any, Any, Any]])
_Fn = TypeVar("_Fn", bound=Callable[..., Any])


def flatten_async(f: _AsyncFn) -> _Fn:
    @functools.wraps(f)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        return asyncio.run(f(*args, **kwargs))

    return typing.cast(_Fn, wrapper)

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

from __future__ import annotations

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
import abc
import base64
import inspect
import json
import os
import typing
import warnings

__all__ = [
    "MissingRequiredEnv",
    "MalformedEnvError",
    "BaseEnv",
    "StrEnv",
    "BoolEnv",
    "IntEnv",
    "ListEnv",
    "FloatEnv",
    "BaseEnvStore",
]


_T = TypeVar("_T", bound=Union[int, str, bool, float, List[str]])


class MissingRequiredEnv(KeyError):
    """
    Raised when required Env is not found.
    """

    pass


class MalformedEnvError(ValueError):
    """
    Raised when the value of the env is not valid.
    """

    pass


try:
    import boto3

    kms_client = boto3.client("kms")

    def _get_env_str(env_name: str) -> str:
        if env_name == "LAND_USE_KMS":  # There's no SEC_LAND_USE_KMS
            return os.getenv(env_name, "0")

        try:
            value = os.environ[env_name]

        except KeyError as e:
            if _USE_KMS.get() and not env_name.startswith("SEC_LAND_"):
                try:
                    return _get_env_str("SEC_" + env_name)

                except KeyError as ee:
                    raise e from ee

            raise

        if env_name.startswith("SEC_"):
            decoded = base64.b64decode(value)

            decrypted_result = kms_client.decrypt(CiphertextBlob=decoded)

            return typing.cast(bytes, decrypted_result["Plaintext"]).decode(
                "utf-8"
            )

        else:
            return value


except ImportError:

    def _get_env_str(env_name: str) -> str:
        return os.environ[env_name]


class BaseEnv(Generic[_T]):
    __env_type_str__ = "(unknown)"

    def __init__(
        self,
        name: str,
        description: Union[str, List[str]] = [],
        *,
        display_name: Optional[str] = None,
        default: Optional[_T] = None,
        required: bool = False,
    ) -> None:
        assert len(name) > 0, "Name cannot be empty"

        upper_name = name.upper()
        if name != upper_name:
            warnings.warn(
                f"Environment Variable should be in uppercase. expected "
                f"`{upper_name}`, got `{name}`."
            )

        self._name = upper_name
        self._default: Optional[_T] = default
        self.description: List[str] = (
            [description] if isinstance(description, str) else description
        )
        self.required = required

        self.display_name = display_name

        self._prefix = ""

    @property
    def name(self) -> str:
        return self._prefix + self._name

    def adjust_value(self, v: _T) -> _T:
        return v

    def _get_default(self) -> _T:
        if self._default is None:
            raise KeyError(self.name)

        return self._default

    def _get(self) -> str:
        return _get_env_str(self.name)

    @staticmethod
    def _decrypt_env_str(env_str: str) -> str:
        import boto3

        kms_client = boto3.client("kms")

        decoded = base64.b64decode(env_str)

        decrypted_result = kms_client.decrypt(CiphertextBlob=decoded)

        return typing.cast(bytes, decrypted_result["Plaintext"]).decode(
            "utf-8"
        )

    @abc.abstractmethod
    def get(self) -> _T:
        raise NotImplementedError

    def set_prefix(self, prefix: str) -> None:
        self._prefix = prefix

    def _get_env_file_default(self) -> str:
        # json.dumps will quote the string properly
        return "" if self._default in (None, "") else json.dumps(self._default)

    def _get_env_file_default_hint(self) -> Optional[str]:
        return str(self._default) if self._default is not None else None

    def _to_env_file_str(self) -> List[str]:
        lines: List[str] = []
        lines.append(
            f"# Env: {self.name}"
            + (f" - {self.display_name}" if self.display_name else "")
        )
        lines.append(f"# Type: {self.__env_type_str__}")

        if self.required:
            lines.append("# Required: True")
        else:
            lines.append("# Required: False")

        if self._get_env_file_default_hint():
            lines.append(f"# Default: {self._get_env_file_default_hint()}")

        lines.append("#")

        lines.extend(["# " + i for i in self.description])

        lines.append(
            ("#" if not self.required else "")
            + self.name
            + "="
            + self._get_env_file_default()
        )

        return lines


class StrEnv(BaseEnv[str]):
    __env_type_str__ = "str"

    def get(self) -> str:
        try:
            v = super()._get()

        except KeyError:
            v = self._get_default()

        return self.adjust_value(v)


class IntEnv(BaseEnv[int]):
    __env_type_str__ = "int"

    def get(self) -> int:
        try:
            v = int(super()._get())

        except KeyError:
            v = self._get_default()

        return self.adjust_value(v)


class FloatEnv(BaseEnv[float]):
    __env_type_str__ = "float"

    def get(self) -> float:
        try:
            v = float(super()._get())

        except KeyError:
            v = self._get_default()

        return self.adjust_value(v)


class BoolEnv(BaseEnv[bool]):
    __env_type_str__ = "bool"

    def get(self) -> bool:
        try:
            v = super()._get().lower().strip() not in (
                "",
                "0",
                "false",
                "off",
                "no",
            )

        except KeyError:
            v = self._get_default()

        return self.adjust_value(v)

    def _get_env_file_default(self) -> str:
        return "1" if self._default is True else "0"

    def _get_env_file_default_hint(self) -> Optional[str]:
        if self._default is None:
            return None

        return "1" if self._default is True else "0"


class ListEnv(BaseEnv[List[str]]):
    """
    Does not support comma escaping at the moment.
    """

    __env_type_str__ = "List[str]"

    def get(self) -> List[str]:
        try:
            v = [i.strip() for i in super()._get().split(",")]

        except KeyError:
            v = self._get_default()

        return self.adjust_value(v)


_USE_KMS = BoolEnv("LAND_USE_KMS", default=False)


_TC = TypeVar("_TC", bound="BaseEnvStore")

_ENV_STORE: Dict[Type[BaseEnvStore], BaseEnvStore] = {}


class BaseEnvStore:
    _prefix: str = ""

    _parent_prefix: str = ""
    __parent_prefix_set__: bool = False

    def __init__(self, *, _skip_required: bool) -> None:
        for k, v in self._get_envs().items():
            if v._name.lower() != k:
                raise AttributeError(
                    f"Name for Env `{v._name.lower()}` is different "
                    f"than its attribute name `{k}`."
                )
            v.set_prefix(self.prefix)

            try:
                if not _skip_required:
                    v.get()

            except KeyError as e:
                if v.required:
                    raise MissingRequiredEnv(
                        f"Env `{v.name}` is required, but not found."
                    ) from e

        for k2, v2 in self._get_env_stores().items():
            if v2._prefix.lower()[:-1] != k2.lower():
                raise AttributeError(
                    f"Name for `{v2.__name__}` `{v2._prefix}` is different "
                    f"than its attribute name `{k2}`."
                )

            assert (
                v2.__parent_prefix_set__ is False
                or v2._parent_prefix == self._prefix
            ), "You cannot reuse Envs."
            v2.__parent_prefix_set__ = True
            v2._parent_prefix = self.prefix

            v2.get(_skip_required=_skip_required)

    def _get_envs(self) -> Dict[str, BaseEnv[Any]]:
        envs: Dict[str, BaseEnv[Any]] = {}

        for k in dir(self):
            if k.startswith("__") and k.endswith("__"):
                continue

            v = getattr(self, k)

            if isinstance(v, BaseEnv):
                envs[k] = v

        return envs

    def _get_env_stores(self) -> Dict[str, Type[BaseEnvStore]]:
        stores: Dict[str, Type[BaseEnvStore]] = {}

        for k in dir(self):
            if k.startswith("__") and k.endswith("__"):
                continue

            v = getattr(self, k)

            if inspect.isclass(v) and issubclass(v, BaseEnvStore):
                stores[k] = v

        return stores

    @property
    def prefix(self) -> str:
        return self._parent_prefix + self._prefix

    @classmethod
    def get(cls: Type[_TC], *, _skip_required: bool = False) -> _TC:
        if cls not in _ENV_STORE:
            _ENV_STORE[cls] = cls(_skip_required=_skip_required)

        return typing.cast(_TC, _ENV_STORE[cls])

    def _to_env_file_str(self) -> List[str]:
        lines = []
        if self._prefix and self.__parent_prefix_set__:
            lines.append("")
            nice_prefix = self._prefix.replace("_", " ").strip().title()
            lines.append(f"### {nice_prefix} Envs ###")
            lines.append("")

        for i in self._get_envs().values():
            lines.extend(i._to_env_file_str())
            lines.append("")

        for j in self._get_env_stores().values():
            lines.extend(j.get(_skip_required=True)._to_env_file_str())
            # lines.append("")

        return lines

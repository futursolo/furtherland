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


from tornado.gen import *
from collections import OrderedDict
import motor


class Element:
    def __init__(self, collection, dict_key):
        self._current_collection = collection
        self._dict_key = dict_key
        self.reset()

    def find(self, condition={}, ignore=None):
        self.reset()
        find = []
        find.append(condition)
        if ignore:
            ignore_condition = {}
            for item in ignore:
                ignore_condition[item] = 0
            find.append(ignore_condition)
        self._action = self._current_collection.find(*find)
        self._action_ready = True
        self._use_cursor = True
        self._allow_filter = True
        self._length = 1
        return self

    def earse(self, condition):
        self.reset()
        self._action = self._current_collection.remove(condition)
        self._action_ready = True
        return self

    def add(self, content):
        self.reset()
        self._action = self._current_collection.insert(condition)
        self._action_ready = True
        return self

    def set(self, condition, content):
        self.reset()
        self._action = self._current_collection.update(condition, content)
        self._action_ready = True
        return self

    def find_modify(self, condition, update, method="inc", new=True):
        self.reset()
        if method == "inc":
            update_condition = {}
            for item in update:
                update_condition[item] = 1
            update = {"$inc": update_condition}
        elif method == "disinc":
            update_condition = {}
            for item in update:
                update_condition[item] = -1
            update = {"$inc": update_condition}
        elif method == "set":
            update_condition = update
            update = {"$set": update_condition}
        self._action = self._current_collection.find_and_modify(
            query=condition, update=update, new=new)
        self._action_ready = True
        return self

    def count(self):
        self.reset()
        self._action = self._current_collection.count()
        self._action_ready = True
        return self

    def skip(self, skip=0):
        if (not (hasattr(self, "_skiped") and
                 self._skiped)) and self._allow_filter:
            self._action.skip(skip)
            self._skiped = True
        else:
            raise Exception
        return self

    def length(self, length=1, force_dict=False):
        if (not (hasattr(self, "_lengthed") and
                 self._lengthed)) and self._allow_filter:
            self._length = length
            self._force_dict = force_dict
            self._lengthed = True
        else:
            raise Exception
        return self

    def sort(self, sort):
        if (not (hasattr(self, "_sorted") and
                 self._sorted)) and self._allow_filter:
            sort_condition = []
            for item in sort:
                if item[1]:
                    sort_condition.append((item[0], 1))
                else:
                    sort_condition.append((item[0], -1))
            self._action.sort(sort_condition)
            self._sorted = True
        else:
            raise Exception
        return self

    @coroutine
    def do(self):
        if (not self._result_ready) and self._action_ready:
            if self._use_cursor:
                if self._length != 0:
                    self._action.limit(self._length)
                self._result = OrderedDict()
                while (yield self._action.fetch_next):
                    item = self._action.next_object()
                    self._result[item[self._dict_key]] = item
                if self._length == 1 and (not self._force_dict):
                    self._result = self._result[list(self._result.keys())[0]]
            else:
                self._result = yield self._action
            self._result_ready = True
            self._action_ready = False
            self._allow_filter = False
        else:
            raise Exception

    def result(self):
        if self._result_ready:
            self._result_ready = False
            return self._result
        else:
            raise Exception

    def reset(self):
        self._length = 1
        self._use_cursor = False
        self._allow_filter = False
        self._skiped = False
        self._lengthed = False
        self._sorted = False
        self._result_ready = False
        self._action_ready = False
        self._force_dict = False
        return self


class Records:
    def __init__(self, library):
        self.library = library
        self.connection = motor.MotorClient(
            "mongodb://" + self.library["user"] +
            ":" + self.library["passwd"] +
            "@" + self.library["host"] + ":" +
            str(self.library["port"]) +
            "/" + self.library["database"])
        self.database = self.connection[
            self.library["database"]]

    def select(self, collection):
        _current_collection = self.database[
            self.library["prefix"] + collection]
        return Element(collection=_current_collection, dict_key="_id")

    def __del__(self):
        self.connection.disconnect()
        del self.connection

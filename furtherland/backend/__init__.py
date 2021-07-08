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

# Table: Classes
# Table: Class_Options
#        for_class: -> Class.id(one-to-many)
from .classes import Class, ClassOption

# Backend and BaseModel
from .common import Backend, BaseModel

# Table: Options
from .options import BaseOption, Option

# Table: Replies
#        for_work: -> Work(one-to-many)
#        parent: -> Optional[Reply](one-to-many)
#        for_resident: -> Optional[Resident](one-to-many)
#        options: List[Reply_Option](backref)
#        children: List[Reply](backref)
# Table: Reply_Options
#        for_reply: -> Reply(one-to-many)
from .replies import Reply, ReplyOption

# Table: Residents
#        options: List[Resident_Option](backref)
#        works: List[Work](backref)
#        replies: List[Reply](backref)
#        visits: List[Visit](backref)
# Table: Resident_Options
#        for_resident: -> Resident(one-to-many)
from .residents import ResidencyStatus, Resident, ResidentOption

# Table: Tags
#        works: List[Work](many-to-many)
#        options: List[Tag_Option](backref)
# Table: Tag_Options
#        for_tag: -> Tag(one-to-many)
from .tags import Tag, TagOption

# Table: Visits
#        for_resident: -> Resident(one-to-many)
#        options: List[Visit_Option](backref)
# Table: Visit_Options
#        for_visit: -> Visit(one-to-many)
from .visits import Visit, VisitOption

# Table: Works
#        for_resident: -> Optional[Resident](one-to-many)
#        for_class: Optional[Resident](one-to-many)
#        tags: List[Tag](many-to-many)
# Table: Work_Options
#        for_work: -> Work(one-to-many)
from .works import Work, WorkOption

__all__ = [
    "Backend",
    "BaseModel",
    "BaseOption",
    "Option",
    "Resident",
    "ResidencyStatus",
    "ResidentOption",
    "Visit",
    "VisitOption",
    "Class",
    "ClassOption",
    "Tag",
    "TagOption",
    "Work",
    "WorkOption",
    "Reply",
    "ReplyOption",
]

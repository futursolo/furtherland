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

from .common import BackendMeta, meta, BaseModel

# Table: Options
from .options import Option

# Table: Residents
# Table: Resident_Options
#        resident_id: -> Resident.id(one-to-many)

# Table: Writings
#        resident_id: -> Resident.id(one-to-many)
# Table: Writing_Options
#        writing_id: -> Writing.id(one-to-many)

# Table: Replies
#        writing_id: -> Writing.id(one-to-many)
#        resident_id: -> Optional[Resident.id](one-to-many)
# Table: Reply_Options
#        reply_id: -> Reply.id(one-to-many)

# Table: furtherland_classes
# Table: furtherland_class_options

# Table: furtherland_tags
# Table: furtherland_tag_options

# Table: furtherland_writing_tag_relationships

__all__ = ["BackendMeta", "meta", "Option", "BaseModel"]

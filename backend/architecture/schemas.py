from ninja import Schema
from typing import Optional, List
from datetime import datetime


# Base schemas
class ComponentTypeSchema(Schema):
    id: int
    name: str


class ComponentTypeCreateSchema(Schema):
    name: str


class OperationTypeSchema(Schema):
    id: int
    name: str


class OperationTypeCreateSchema(Schema):
    name: str


class InfoObjectSchema(Schema):
    id: int
    name: str


class InfoObjectCreateSchema(Schema):
    name: str


# DD Group schemas
class DdGroupTypeSchema(Schema):
    id: int
    name: str


class DdGroupTypeCreateSchema(Schema):
    name: str


class DdGroupSchema(Schema):
    id: int
    parent_id: Optional[int] = None
    name: str
    type_id: int
    type_name: str
    instances: Optional[int] = None
    specification: str

    class Config:
        from_attributes = True

    @staticmethod
    def resolve_type_name(obj):
        return obj.type.name


class DdGroupCreateSchema(Schema):
    parent_id: Optional[int] = None
    name: str
    type_id: int
    instances: Optional[int] = None
    specification: str = ""


class DdGroupUpdateSchema(Schema):
    parent_id: Optional[int] = None
    name: Optional[str] = None
    type_id: Optional[int] = None
    instances: Optional[int] = None
    specification: Optional[str] = None


# C2 Group schemas
class C2GroupTypeSchema(Schema):
    id: int
    name: str


class C2GroupTypeCreateSchema(Schema):
    name: str


class C2GroupSchema(Schema):
    id: int
    parent_id: Optional[int] = None
    name: str
    type_id: int


class C2GroupCreateSchema(Schema):
    parent_id: Optional[int] = None
    name: str
    type_id: int


class C2GroupUpdateSchema(Schema):
    parent_id: Optional[int] = None
    name: Optional[str] = None
    type_id: Optional[int] = None


# Component schemas
class C2ComponentSchema(Schema):
    id: int
    name: str
    type_id: int
    technology: str
    description: str
    group_id: int
    is_external: bool


class C2ComponentCreateSchema(Schema):
    name: str
    type_id: int
    technology: str = ""
    description: str = ""
    group_id: int
    is_external: bool = False


class C2ComponentUpdateSchema(Schema):
    name: Optional[str] = None
    type_id: Optional[int] = None
    technology: Optional[str] = None
    description: Optional[str] = None
    group_id: Optional[int] = None
    is_external: Optional[bool] = None


class DdComponentSchema(Schema):
    id: int
    name: str
    c2_component_id: Optional[int] = None
    type_id: int
    type_name: str
    technology: str
    description: str
    group_id: int
    is_external: bool

    class Config:
        from_attributes = True

    @staticmethod
    def resolve_type_name(obj):
        return obj.type.name


class DdComponentCreateSchema(Schema):
    name: str
    c2_component_id: Optional[int] = None
    type_id: int
    technology: str = ""
    description: str = ""
    group_id: int
    is_external: bool = False


class DdComponentUpdateSchema(Schema):
    name: Optional[str] = None
    c2_component_id: Optional[int] = None
    type_id: Optional[int] = None
    technology: Optional[str] = None
    description: Optional[str] = None
    group_id: Optional[int] = None
    is_external: Optional[bool] = None


# Link schemas
class DdLinkProtocolSchema(Schema):
    id: int
    name: str


class DdLinkProtocolCreateSchema(Schema):
    name: str


class DdLinkPortSchema(Schema):
    id: int
    dd_link_id: int
    port: int


class DdLinkPortCreateSchema(Schema):
    dd_link_id: int
    port: int


class DdLinkPortUpdateSchema(Schema):
    dd_link_id: Optional[int] = None
    port: Optional[int] = None


class DdLinkSchema(Schema):
    id: int
    group_from_id: int
    group_to_id: int
    protocol_id: int


class DdLinkCreateSchema(Schema):
    group_from_id: int
    group_to_id: int
    protocol_id: int


class DdLinkUpdateSchema(Schema):
    group_from_id: Optional[int] = None
    group_to_id: Optional[int] = None
    protocol_id: Optional[int] = None


class C2LinkSchema(Schema):
    id: int
    component_from_id: int
    component_to_id: int
    name: str
    technology: str
    format: str


class C2LinkCreateSchema(Schema):
    component_from_id: int
    component_to_id: int
    name: str = ""
    technology: str = ""
    format: str = ""


class C2LinkUpdateSchema(Schema):
    component_from_id: Optional[int] = None
    component_to_id: Optional[int] = None
    name: Optional[str] = None
    technology: Optional[str] = None
    format: Optional[str] = None


class C2LinksInfoObjectsSchema(Schema):
    id: int
    c2_link_id: int
    infoobject_id: int
    operation_type_id: int


class C2LinksInfoObjectsCreateSchema(Schema):
    c2_link_id: int
    infoobject_id: int
    operation_type_id: int


class C2LinksInfoObjectsUpdateSchema(Schema):
    c2_link_id: Optional[int] = None
    infoobject_id: Optional[int] = None
    operation_type_id: Optional[int] = None


# Error schema
class ErrorSchema(Schema):
    detail: str


# Export schemas
class ExportElementSchema(Schema):
    element_id: int
    element_type: str


class ExportElementMultipleItemSchema(Schema):
    id: int
    type: str


class ExportMultipleElementsSchema(Schema):
    elements: List[ExportElementMultipleItemSchema]


class ExportAllGroupsSchema(Schema):
    root_group_id: Optional[int] = None 
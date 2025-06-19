from django.contrib import admin
from .models import (
    ComponentType, OperationType, InfoObject,
    DdGroupType, DdGroup, C2GroupType, C2Group,
    C2Component, DdComponent, DdLinkProtocol, DdLinkPort,
    DdLink, C2Link, C2LinksInfoObjects
)


@admin.register(ComponentType)
class ComponentTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(OperationType)
class OperationTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(InfoObject)
class InfoObjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(DdGroupType)
class DdGroupTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(DdGroup)
class DdGroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'type', 'parent', 'instances']
    list_filter = ['type', 'instances']
    search_fields = ['name']
    raw_id_fields = ['parent']


@admin.register(C2GroupType)
class C2GroupTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(C2Group)
class C2GroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'type', 'parent']
    list_filter = ['type']
    search_fields = ['name']
    raw_id_fields = ['parent']


@admin.register(C2Component)
class C2ComponentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'type', 'group', 'technology', 'is_external']
    list_filter = ['type', 'group', 'is_external']
    search_fields = ['name', 'technology', 'description']
    raw_id_fields = ['type', 'group']


@admin.register(DdComponent)
class DdComponentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'type', 'group', 'c2_component', 'technology', 'is_external']
    list_filter = ['type', 'group', 'is_external']
    search_fields = ['name', 'technology', 'description']
    raw_id_fields = ['type', 'group', 'c2_component']


@admin.register(DdLinkProtocol)
class DdLinkProtocolAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(DdLinkPort)
class DdLinkPortAdmin(admin.ModelAdmin):
    list_display = ['id', 'dd_link', 'port']
    list_filter = ['dd_link__protocol']
    search_fields = ['dd_link__group_from__name', 'dd_link__group_to__name']
    raw_id_fields = ['dd_link']


@admin.register(DdLink)
class DdLinkAdmin(admin.ModelAdmin):
    list_display = ['id', 'group_from', 'group_to', 'protocol']
    list_filter = ['protocol']
    search_fields = ['group_from__name', 'group_to__name', 'protocol__name']
    raw_id_fields = ['group_from', 'group_to', 'protocol']


@admin.register(C2Link)
class C2LinkAdmin(admin.ModelAdmin):
    list_display = ['id', 'component_from', 'component_to', 'name', 'technology', 'format']
    list_filter = ['technology', 'format']
    search_fields = ['name', 'component_from__name', 'component_to__name']
    raw_id_fields = ['component_from', 'component_to']


@admin.register(C2LinksInfoObjects)
class C2LinksInfoObjectsAdmin(admin.ModelAdmin):
    list_display = ['id', 'c2_link', 'infoobject', 'operation_type']
    list_filter = ['operation_type']
    search_fields = ['c2_link__name', 'infoobject__name']
    raw_id_fields = ['c2_link', 'infoobject', 'operation_type']

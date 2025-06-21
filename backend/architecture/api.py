from ninja import Router
from django.shortcuts import get_object_or_404
from django.http import Http404, HttpResponse
from typing import List, Optional
from django.db import models

from .models import (
    ComponentType, OperationType, InfoObject,
    DdGroupType, DdGroup, C2GroupType, C2Group,
    C2Component, DdComponent, DdLinkProtocol, DdLinkPort,
    C2Link, DdLink, C2LinksInfoObjects
)
from .schemas import (
    ComponentTypeSchema, ComponentTypeCreateSchema,
    OperationTypeSchema, OperationTypeCreateSchema,
    InfoObjectSchema, InfoObjectCreateSchema,
    DdGroupTypeSchema, DdGroupTypeCreateSchema,
    DdGroupSchema, DdGroupCreateSchema, DdGroupUpdateSchema,
    C2GroupTypeSchema, C2GroupTypeCreateSchema,
    C2GroupSchema, C2GroupCreateSchema, C2GroupUpdateSchema,
    C2ComponentSchema, C2ComponentCreateSchema, C2ComponentUpdateSchema,
    DdComponentSchema, DdComponentCreateSchema, DdComponentUpdateSchema,
    DdLinkProtocolSchema, DdLinkProtocolCreateSchema,
    DdLinkPortSchema, DdLinkPortCreateSchema, DdLinkPortUpdateSchema,
    DdLinkSchema, DdLinkCreateSchema, DdLinkUpdateSchema, DdLinkDetailSchema,
    C2LinkSchema, C2LinkCreateSchema, C2LinkUpdateSchema,
    C2LinksInfoObjectsSchema, C2LinksInfoObjectsCreateSchema, C2LinksInfoObjectsUpdateSchema,
    ErrorSchema, ExportElementSchema, ExportMultipleElementsSchema, ExportAllGroupsSchema
)
from .export.drawio_export import DrawioExporter

router = Router()


# Component Types
@router.get("/component-types", response=List[ComponentTypeSchema])
def list_component_types(request):
    """Получить список всех типов компонентов"""
    return ComponentType.objects.all()


@router.post("/component-types", response=ComponentTypeSchema)
def create_component_type(request, payload: ComponentTypeCreateSchema):
    """Создать новый тип компонента"""
    component_type = ComponentType.objects.create(**payload.dict())
    return component_type


@router.get("/component-types/{component_type_id}", response=ComponentTypeSchema)
def get_component_type(request, component_type_id: int):
    """Получить тип компонента по ID"""
    return get_object_or_404(ComponentType, id=component_type_id)


@router.put("/component-types/{component_type_id}", response=ComponentTypeSchema)
def update_component_type(request, component_type_id: int, payload: ComponentTypeCreateSchema):
    """Обновить тип компонента"""
    component_type = get_object_or_404(ComponentType, id=component_type_id)
    for attr, value in payload.dict().items():
        setattr(component_type, attr, value)
    component_type.save()
    return component_type


@router.delete("/component-types/{component_type_id}")
def delete_component_type(request, component_type_id: int):
    """Удалить тип компонента"""
    component_type = get_object_or_404(ComponentType, id=component_type_id)
    component_type.delete()
    return {"success": True}


# Operation Types
@router.get("/operation-types", response=List[OperationTypeSchema])
def list_operation_types(request):
    """Получить список всех типов операций"""
    return OperationType.objects.all()


@router.post("/operation-types", response=OperationTypeSchema)
def create_operation_type(request, payload: OperationTypeCreateSchema):
    """Создать новый тип операции"""
    operation_type = OperationType.objects.create(**payload.dict())
    return operation_type


@router.get("/operation-types/{operation_type_id}", response=OperationTypeSchema)
def get_operation_type(request, operation_type_id: int):
    """Получить тип операции по ID"""
    return get_object_or_404(OperationType, id=operation_type_id)


@router.put("/operation-types/{operation_type_id}", response=OperationTypeSchema)
def update_operation_type(request, operation_type_id: int, payload: OperationTypeCreateSchema):
    """Обновить тип операции"""
    operation_type = get_object_or_404(OperationType, id=operation_type_id)
    for attr, value in payload.dict().items():
        setattr(operation_type, attr, value)
    operation_type.save()
    return operation_type


@router.delete("/operation-types/{operation_type_id}")
def delete_operation_type(request, operation_type_id: int):
    """Удалить тип операции"""
    operation_type = get_object_or_404(OperationType, id=operation_type_id)
    operation_type.delete()
    return {"success": True}


# Info Objects
@router.get("/info-objects", response=List[InfoObjectSchema])
def list_info_objects(request):
    """Получить список всех информационных объектов"""
    return InfoObject.objects.all()


@router.post("/info-objects", response=InfoObjectSchema)
def create_info_object(request, payload: InfoObjectCreateSchema):
    """Создать новый информационный объект"""
    info_object = InfoObject.objects.create(**payload.dict())
    return info_object


@router.get("/info-objects/{info_object_id}", response=InfoObjectSchema)
def get_info_object(request, info_object_id: int):
    """Получить информационный объект по ID"""
    return get_object_or_404(InfoObject, id=info_object_id)


@router.put("/info-objects/{info_object_id}", response=InfoObjectSchema)
def update_info_object(request, info_object_id: int, payload: InfoObjectCreateSchema):
    """Обновить информационный объект"""
    info_object = get_object_or_404(InfoObject, id=info_object_id)
    for attr, value in payload.dict().items():
        setattr(info_object, attr, value)
    info_object.save()
    return info_object


@router.delete("/info-objects/{info_object_id}")
def delete_info_object(request, info_object_id: int):
    """Удалить информационный объект"""
    info_object = get_object_or_404(InfoObject, id=info_object_id)
    info_object.delete()
    return {"success": True}


# DD Group Types
@router.get("/dd-group-types", response=List[DdGroupTypeSchema])
def list_dd_group_types(request):
    """Получить список всех типов групп DD"""
    return DdGroupType.objects.all()


@router.post("/dd-group-types", response=DdGroupTypeSchema)
def create_dd_group_type(request, payload: DdGroupTypeCreateSchema):
    """Создать новый тип группы DD"""
    dd_group_type = DdGroupType.objects.create(**payload.dict())
    return dd_group_type


@router.get("/dd-group-types/{dd_group_type_id}", response=DdGroupTypeSchema)
def get_dd_group_type(request, dd_group_type_id: int):
    """Получить тип группы DD по ID"""
    return get_object_or_404(DdGroupType, id=dd_group_type_id)


@router.put("/dd-group-types/{dd_group_type_id}", response=DdGroupTypeSchema)
def update_dd_group_type(request, dd_group_type_id: int, payload: DdGroupTypeCreateSchema):
    """Обновить тип группы DD"""
    dd_group_type = get_object_or_404(DdGroupType, id=dd_group_type_id)
    for attr, value in payload.dict().items():
        setattr(dd_group_type, attr, value)
    dd_group_type.save()
    return dd_group_type


@router.delete("/dd-group-types/{dd_group_type_id}")
def delete_dd_group_type(request, dd_group_type_id: int):
    """Удалить тип группы DD"""
    dd_group_type = get_object_or_404(DdGroupType, id=dd_group_type_id)
    dd_group_type.delete()
    return {"success": True}


# DD Groups
@router.get("/dd-groups", response=List[DdGroupSchema])
def list_dd_groups(request):
    """Получить список всех групп DD"""
    return DdGroup.objects.select_related('type').all()


@router.post("/dd-groups", response=DdGroupSchema)
def create_dd_group(request, payload: DdGroupCreateSchema):
    """Создать новую группу DD"""
    dd_group = DdGroup.objects.create(**payload.dict())
    return dd_group


@router.get("/dd-groups/{dd_group_id}", response=DdGroupSchema)
def get_dd_group(request, dd_group_id: int):
    """Получить группу DD по ID"""
    return get_object_or_404(DdGroup, id=dd_group_id)


@router.put("/dd-groups/{dd_group_id}", response=DdGroupSchema)
def update_dd_group(request, dd_group_id: int, payload: DdGroupUpdateSchema):
    """Обновить группу DD"""
    dd_group = get_object_or_404(DdGroup, id=dd_group_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(dd_group, attr, value)
    dd_group.save()
    return dd_group


@router.delete("/dd-groups/{dd_group_id}")
def delete_dd_group(request, dd_group_id: int):
    """Удалить группу DD"""
    dd_group = get_object_or_404(DdGroup, id=dd_group_id)
    dd_group.delete()
    return {"success": True}


# C2 Group Types
@router.get("/c2-group-types", response=List[C2GroupTypeSchema])
def list_c2_group_types(request):
    """Получить список всех типов групп C2"""
    return C2GroupType.objects.all()


@router.post("/c2-group-types", response=C2GroupTypeSchema)
def create_c2_group_type(request, payload: C2GroupTypeCreateSchema):
    """Создать новый тип группы C2"""
    c2_group_type = C2GroupType.objects.create(**payload.dict())
    return c2_group_type


@router.get("/c2-group-types/{c2_group_type_id}", response=C2GroupTypeSchema)
def get_c2_group_type(request, c2_group_type_id: int):
    """Получить тип группы C2 по ID"""
    return get_object_or_404(C2GroupType, id=c2_group_type_id)


@router.put("/c2-group-types/{c2_group_type_id}", response=C2GroupTypeSchema)
def update_c2_group_type(request, c2_group_type_id: int, payload: C2GroupTypeCreateSchema):
    """Обновить тип группы C2"""
    c2_group_type = get_object_or_404(C2GroupType, id=c2_group_type_id)
    for attr, value in payload.dict().items():
        setattr(c2_group_type, attr, value)
    c2_group_type.save()
    return c2_group_type


@router.delete("/c2-group-types/{c2_group_type_id}")
def delete_c2_group_type(request, c2_group_type_id: int):
    """Удалить тип группы C2"""
    c2_group_type = get_object_or_404(C2GroupType, id=c2_group_type_id)
    c2_group_type.delete()
    return {"success": True}


# C2 Groups
@router.get("/c2-groups", response=List[C2GroupSchema])
def list_c2_groups(request):
    """Получить список всех групп C2"""
    return C2Group.objects.all()


@router.post("/c2-groups", response=C2GroupSchema)
def create_c2_group(request, payload: C2GroupCreateSchema):
    """Создать новую группу C2"""
    c2_group = C2Group.objects.create(**payload.dict())
    return c2_group


@router.get("/c2-groups/{c2_group_id}", response=C2GroupSchema)
def get_c2_group(request, c2_group_id: int):
    """Получить группу C2 по ID"""
    return get_object_or_404(C2Group, id=c2_group_id)


@router.put("/c2-groups/{c2_group_id}", response=C2GroupSchema)
def update_c2_group(request, c2_group_id: int, payload: C2GroupUpdateSchema):
    """Обновить группу C2"""
    c2_group = get_object_or_404(C2Group, id=c2_group_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(c2_group, attr, value)
    c2_group.save()
    return c2_group


@router.delete("/c2-groups/{c2_group_id}")
def delete_c2_group(request, c2_group_id: int):
    """Удалить группу C2"""
    c2_group = get_object_or_404(C2Group, id=c2_group_id)
    c2_group.delete()
    return {"success": True}


# C2 Components
@router.get("/c2-components", response=List[C2ComponentSchema])
def list_c2_components(request):
    """Получить список всех компонентов C2"""
    return C2Component.objects.all()


@router.post("/c2-components", response=C2ComponentSchema)
def create_c2_component(request, payload: C2ComponentCreateSchema):
    """Создать новый компонент C2"""
    c2_component = C2Component.objects.create(**payload.dict())
    return c2_component


@router.get("/c2-components/{c2_component_id}", response=C2ComponentSchema)
def get_c2_component(request, c2_component_id: int):
    """Получить компонент C2 по ID"""
    return get_object_or_404(C2Component, id=c2_component_id)


@router.put("/c2-components/{c2_component_id}", response=C2ComponentSchema)
def update_c2_component(request, c2_component_id: int, payload: C2ComponentUpdateSchema):
    """Обновить компонент C2"""
    c2_component = get_object_or_404(C2Component, id=c2_component_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(c2_component, attr, value)
    c2_component.save()
    return c2_component


@router.delete("/c2-components/{c2_component_id}")
def delete_c2_component(request, c2_component_id: int):
    """Удалить компонент C2"""
    c2_component = get_object_or_404(C2Component, id=c2_component_id)
    c2_component.delete()
    return {"success": True}


# DD Components
@router.get("/dd-components", response=List[DdComponentSchema])
def list_dd_components(request):
    """Получить список всех компонентов DD"""
    return DdComponent.objects.select_related('type').all()


@router.post("/dd-components", response=DdComponentSchema)
def create_dd_component(request, payload: DdComponentCreateSchema):
    """Создать новый компонент DD"""
    dd_component = DdComponent.objects.create(**payload.dict())
    return dd_component


@router.get("/dd-components/{dd_component_id}", response=DdComponentSchema)
def get_dd_component(request, dd_component_id: int):
    """Получить компонент DD по ID"""
    return get_object_or_404(DdComponent, id=dd_component_id)


@router.put("/dd-components/{dd_component_id}", response=DdComponentSchema)
def update_dd_component(request, dd_component_id: int, payload: DdComponentUpdateSchema):
    """Обновить компонент DD"""
    dd_component = get_object_or_404(DdComponent, id=dd_component_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(dd_component, attr, value)
    dd_component.save()
    return dd_component


@router.delete("/dd-components/{dd_component_id}")
def delete_dd_component(request, dd_component_id: int):
    """Удалить компонент DD"""
    dd_component = get_object_or_404(DdComponent, id=dd_component_id)
    dd_component.delete()
    return {"success": True}


# DD Link Protocols
@router.get("/dd-link-protocols", response=List[DdLinkProtocolSchema])
def list_dd_link_protocols(request):
    """Получить список всех протоколов связи DD"""
    return DdLinkProtocol.objects.all()


@router.post("/dd-link-protocols", response=DdLinkProtocolSchema)
def create_dd_link_protocol(request, payload: DdLinkProtocolCreateSchema):
    """Создать новый протокол связи DD"""
    dd_link_protocol = DdLinkProtocol.objects.create(**payload.dict())
    return dd_link_protocol


@router.get("/dd-link-protocols/{dd_link_protocol_id}", response=DdLinkProtocolSchema)
def get_dd_link_protocol(request, dd_link_protocol_id: int):
    """Получить протокол связи DD по ID"""
    return get_object_or_404(DdLinkProtocol, id=dd_link_protocol_id)


@router.put("/dd-link-protocols/{dd_link_protocol_id}", response=DdLinkProtocolSchema)
def update_dd_link_protocol(request, dd_link_protocol_id: int, payload: DdLinkProtocolCreateSchema):
    """Обновить протокол связи DD"""
    dd_link_protocol = get_object_or_404(DdLinkProtocol, id=dd_link_protocol_id)
    for attr, value in payload.dict().items():
        setattr(dd_link_protocol, attr, value)
    dd_link_protocol.save()
    return dd_link_protocol


@router.delete("/dd-link-protocols/{dd_link_protocol_id}")
def delete_dd_link_protocol(request, dd_link_protocol_id: int):
    """Удалить протокол связи DD"""
    dd_link_protocol = get_object_or_404(DdLinkProtocol, id=dd_link_protocol_id)
    dd_link_protocol.delete()
    return {"success": True}


# DD Link Ports
@router.get("/dd-link-ports", response=List[DdLinkPortSchema])
def list_dd_link_ports(request):
    """Получить список всех портов связи DD"""
    return DdLinkPort.objects.all()


@router.post("/dd-link-ports", response=DdLinkPortSchema)
def create_dd_link_port(request, payload: DdLinkPortCreateSchema):
    """Создать новый порт связи DD"""
    dd_link_port = DdLinkPort.objects.create(**payload.dict())
    return dd_link_port


@router.get("/dd-link-ports/{dd_link_port_id}", response=DdLinkPortSchema)
def get_dd_link_port(request, dd_link_port_id: int):
    """Получить порт связи DD по ID"""
    return get_object_or_404(DdLinkPort, id=dd_link_port_id)


@router.put("/dd-link-ports/{dd_link_port_id}", response=DdLinkPortSchema)
def update_dd_link_port(request, dd_link_port_id: int, payload: DdLinkPortUpdateSchema):
    """Обновить порт связи DD"""
    dd_link_port = get_object_or_404(DdLinkPort, id=dd_link_port_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(dd_link_port, attr, value)
    dd_link_port.save()
    return dd_link_port


@router.delete("/dd-link-ports/{dd_link_port_id}")
def delete_dd_link_port(request, dd_link_port_id: int):
    """Удалить порт связи DD"""
    dd_link_port = get_object_or_404(DdLinkPort, id=dd_link_port_id)
    dd_link_port.delete()
    return {"success": True}


# DD Links
@router.get("/dd-links", response=List[DdLinkSchema])
def list_dd_links(request):
    """Получить список всех связей DD"""
    return DdLink.objects.all()


@router.post("/dd-links", response=DdLinkSchema)
def create_dd_link(request, payload: DdLinkCreateSchema):
    """Создать новую связь DD"""
    dd_link = DdLink.objects.create(**payload.dict())
    return dd_link


@router.get("/dd-links/{dd_link_id}", response=DdLinkSchema)
def get_dd_link(request, dd_link_id: int):
    """Получить связь DD по ID"""
    return get_object_or_404(DdLink, id=dd_link_id)


@router.put("/dd-links/{dd_link_id}", response=DdLinkSchema)
def update_dd_link(request, dd_link_id: int, payload: DdLinkUpdateSchema):
    """Обновить связь DD"""
    dd_link = get_object_or_404(DdLink, id=dd_link_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(dd_link, attr, value)
    dd_link.save()
    return dd_link


@router.delete("/dd-links/{dd_link_id}")
def delete_dd_link(request, dd_link_id: int):
    """Удалить связь DD"""
    dd_link = get_object_or_404(DdLink, id=dd_link_id)
    dd_link.delete()
    return {"success": True}


@router.get("/dd-groups/{group_id}/links", response=List[DdLinkDetailSchema])
def get_group_links(request, group_id: int):
    """Получить все связи для группы (входящие и исходящие)"""
    group = get_object_or_404(DdGroup, id=group_id)
    
    # Получаем все связи где группа является источником или назначением
    links = DdLink.objects.filter(
        models.Q(group_from=group) | models.Q(group_to=group)
    ).select_related('protocol').prefetch_related('ports')
    
    return links


# C2 Links
@router.get("/c2-links", response=List[C2LinkSchema])
def list_c2_links(request):
    """Получить список всех связей C2"""
    return C2Link.objects.all()


@router.post("/c2-links", response=C2LinkSchema)
def create_c2_link(request, payload: C2LinkCreateSchema):
    """Создать новую связь C2"""
    c2_link = C2Link.objects.create(**payload.dict())
    return c2_link


@router.get("/c2-links/{c2_link_id}", response=C2LinkSchema)
def get_c2_link(request, c2_link_id: int):
    """Получить связь C2 по ID"""
    return get_object_or_404(C2Link, id=c2_link_id)


@router.put("/c2-links/{c2_link_id}", response=C2LinkSchema)
def update_c2_link(request, c2_link_id: int, payload: C2LinkUpdateSchema):
    """Обновить связь C2"""
    c2_link = get_object_or_404(C2Link, id=c2_link_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(c2_link, attr, value)
    c2_link.save()
    return c2_link


@router.delete("/c2-links/{c2_link_id}")
def delete_c2_link(request, c2_link_id: int):
    """Удалить связь C2"""
    c2_link = get_object_or_404(C2Link, id=c2_link_id)
    c2_link.delete()
    return {"success": True}


# C2 Links Info Objects
@router.get("/c2-links-info-objects", response=List[C2LinksInfoObjectsSchema])
def list_c2_links_info_objects(request):
    """Получить список всех связей C2 - Информационные объекты"""
    return C2LinksInfoObjects.objects.all()


@router.post("/c2-links-info-objects", response=C2LinksInfoObjectsSchema)
def create_c2_links_info_objects(request, payload: C2LinksInfoObjectsCreateSchema):
    """Создать новую связь C2 - Информационный объект"""
    c2_links_info_objects = C2LinksInfoObjects.objects.create(**payload.dict())
    return c2_links_info_objects


@router.get("/c2-links-info-objects/{c2_links_info_objects_id}", response=C2LinksInfoObjectsSchema)
def get_c2_links_info_objects(request, c2_links_info_objects_id: int):
    """Получить связь C2 - Информационный объект по ID"""
    return get_object_or_404(C2LinksInfoObjects, id=c2_links_info_objects_id)


@router.put("/c2-links-info-objects/{c2_links_info_objects_id}", response=C2LinksInfoObjectsSchema)
def update_c2_links_info_objects(request, c2_links_info_objects_id: int, payload: C2LinksInfoObjectsUpdateSchema):
    """Обновить связь C2 - Информационный объект"""
    c2_links_info_objects = get_object_or_404(C2LinksInfoObjects, id=c2_links_info_objects_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(c2_links_info_objects, attr, value)
    c2_links_info_objects.save()
    return c2_links_info_objects


@router.delete("/c2-links-info-objects/{c2_links_info_objects_id}")
def delete_c2_links_info_objects(request, c2_links_info_objects_id: int):
    """Удалить связь C2 - Информационный объект"""
    c2_links_info_objects = get_object_or_404(C2LinksInfoObjects, id=c2_links_info_objects_id)
    c2_links_info_objects.delete()
    return {"success": True}


# Экспорт в drawio
# Унифицированные эндпоинты экспорта

@router.post("/export")
def export_single_element(request, payload: ExportElementSchema):
    """Экспортировать один элемент в формат drawio XML
    
    Body: {"element_id": 1, "element_type": "ddgroup"}
    """
    try:
        element_id = payload.element_id
        element_type = payload.element_type
        
        if element_type not in ['ddgroup', 'ddcomponent']:
            return {"error": "Неподдерживаемый тип элемента. Используйте: ddgroup, ddcomponent"}
        
        exporter = DrawioExporter()
        xml_content = exporter.export_element_to_drawio(element_id, element_type)
        
        response = HttpResponse(xml_content, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename="{element_type}_{element_id}.drawio"'
        return response
    except (DdGroup.DoesNotExist, DdComponent.DoesNotExist):
        raise Http404("Элемент не найден")
    except Exception as e:
        return {"error": f"Ошибка при экспорте: {str(e)}"}


@router.post("/export/multiple")
def export_multiple_elements(request, payload: ExportMultipleElementsSchema):
    """Экспортировать несколько элементов в формат drawio XML
    
    Body: {
        "elements": [{"id": 1, "type": "ddgroup"}, {"id": 2, "type": "ddcomponent"}]
    }
    """
    try:
        elements = payload.elements
        
        if not elements:
            return {"error": "Необходимо указать список элементов"}
        
        # Валидация элементов
        for element in elements:
            if element.type not in ['ddgroup', 'ddcomponent']:
                return {"error": f"Неподдерживаемый тип элемента: {element.type}. Используйте: ddgroup, ddcomponent"}
        
        # Преобразуем в формат для экспортера
        elements_data = [{"id": elem.id, "type": elem.type} for elem in elements]
        
        exporter = DrawioExporter()
        xml_content = exporter.export_multiple_elements_to_drawio(elements_data)
        
        response = HttpResponse(xml_content, content_type='application/xml')
        response['Content-Disposition'] = 'attachment; filename="multiple_elements.drawio"'
        return response
    except (DdGroup.DoesNotExist, DdComponent.DoesNotExist):
        raise Http404("Один или несколько элементов не найдены")
    except Exception as e:
        return {"error": f"Ошибка при экспорте: {str(e)}"}


@router.post("/export/all")
def export_all_groups(request, payload: ExportAllGroupsSchema):
    """Экспортировать все группы или начиная с определенной группы
    
    Body: {"root_group_id": 1} или {}
    """
    try:
        root_group_id = payload.root_group_id
        
        exporter = DrawioExporter()
        xml_content = exporter.export_dd_groups_to_drawio(root_group_id)
        
        response = HttpResponse(xml_content, content_type='application/xml')
        if root_group_id:
            response['Content-Disposition'] = f'attachment; filename="dd_groups_from_{root_group_id}.drawio"'
        else:
            response['Content-Disposition'] = 'attachment; filename="all_dd_groups.drawio"'
        return response
    except DdGroup.DoesNotExist:
        raise Http404("Группа DD не найдена")
    except Exception as e:
        return {"error": f"Ошибка при экспорте: {str(e)}"}

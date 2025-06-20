"""
Модуль для экспорта данных дерева DdGroup в формат drawio (XML)
"""

import xml.etree.ElementTree as ET
from typing import List, Dict, Tuple
from .models import DdGroup


class DrawioExporter:
    """Класс для экспорта дерева DdGroup в формат drawio"""
    
    def __init__(self):
        self.cell_id_counter = 2  # Начинаем с 2, так как 0 и 1 зарезервированы
        self.current_id = 2  # Для нового алгоритма
        self.base_width = 240
        self.base_height = 120
        self.padding = 30  # Увеличиваем отступы
        self.min_child_spacing = 30  # Увеличиваем расстояние между дочерними элементами
        self.header_height = 50  # Высота заголовка
    
    def export_dd_groups_to_drawio(self, root_group_id=None):
        """
        Экспортирует архитектуру в формат Draw.io
        """
        # Определяем какие группы экспортировать
        if root_group_id is None:
            # Экспортируем все корневые группы
            root_groups = list(DdGroup.objects.filter(parent=None))
        else:
            if isinstance(root_group_id, int):
                root_groups = [DdGroup.objects.get(id=root_group_id)]
            elif isinstance(root_group_id, list):
                root_groups = [DdGroup.objects.get(id=g) if isinstance(g, int) else g for g in root_group_id]
            else:
                root_groups = [root_group_id]
        
        # Создаем корневую структуру XML
        root = self._create_xml_structure()
        
        # Получаем корневой элемент для добавления групп
        mxgraph_model = root.find('.//mxGraphModel')
        mxgraph_root = mxgraph_model.find('root')
        
        # Обрабатываем каждую целевую группу
        start_x = 0  # Корневой элемент в (0,0)
        for i, group in enumerate(root_groups):
            # Рассчитываем layout для группы
            group_layout = self._calculate_group_layout(group, start_x, 0)
            
            # Рекурсивно добавляем все элементы в XML
            self._add_layout_to_xml(mxgraph_root, group_layout)
            
            # Сдвигаем позицию для следующей группы
            start_x += group_layout['width'] + 100
        
        return self._xml_to_string(root)
    
    def _create_xml_structure(self):
        """Создает базовую XML структуру для drawio"""
        # Создаем корневой элемент
        mxfile = ET.Element('mxfile', {
            'host': 'Electron',
            'modified': '2025-06-20T14:19:00.651Z',
            'agent': '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/20.8.16 Chrome/106.0.5249.199 Electron/21.4.0 Safari/537.36',
            'version': '20.8.16',
            'etag': 'generated',
            'type': 'device'
        })
        
        # Создаем диаграмму
        diagram = ET.SubElement(mxfile, 'diagram', {
            'name': 'Page-1',
            'id': 'architecture_diagram'
        })
        
        # Создаем модель графа
        mxgraph_model = ET.SubElement(diagram, 'mxGraphModel', {
            'dx': '1420',
            'dy': '893',
            'grid': '1',
            'gridSize': '10',
            'guides': '1',
            'tooltips': '1',
            'connect': '1',
            'arrows': '1',
            'fold': '1',
            'page': '1',
            'pageScale': '1',
            'pageWidth': '850',
            'pageHeight': '1100',
            'math': '0',
            'shadow': '0'
        })
        
        # Создаем корневой элемент
        root = ET.SubElement(mxgraph_model, 'root')
        
        # Добавляем базовые ячейки
        ET.SubElement(root, 'mxCell', {'id': '0'})
        ET.SubElement(root, 'mxCell', {'id': '1', 'parent': '0'})
        
        return mxfile
    
    def _calculate_layout(self, root_groups: List[DdGroup]) -> List[Dict]:
        """
        Рассчитывает размеры и позиции для всех групп в дереве
        
        Returns:
            Список словарей с информацией о группах и их позиционировании
        """
        layout_info = []
        
        # Начальная позиция для корневых элементов
        current_x = 50
        current_y = 50
        
        for root_group in root_groups:
            group_layout = self._calculate_group_layout(root_group, current_x, current_y, None)
            layout_info.extend(group_layout)
            
            # Сдвигаем позицию для следующей корневой группы
            current_x += group_layout[0]['width'] + 50
        
        return layout_info
    
    def _calculate_group_layout(self, group, x=0, y=0, parent_id=None):
        """
        Рассчитывает размеры и позиции элементов в два прохода:
        1) Снизу вверх - только размеры
        2) Сверху вниз - только координаты
        """
        # ПРОХОД 1: Рассчитываем размеры снизу вверх
        size_info = self._calculate_sizes_bottom_up(group)
        
        # ПРОХОД 2: Рассчитываем координаты сверху вниз
        layout = self._calculate_positions_top_down(group, size_info, x, y, parent_id)
        
        return layout
    
    def _calculate_sizes_bottom_up(self, group):
        """
        ПРОХОД 1: Рассчитывает размеры всех элементов снизу вверх
        Возвращает словарь {group_id: {'width': w, 'height': h, 'children': [...]}}
        """
        children = list(DdGroup.objects.filter(parent=group))
        
        # Если это листовой элемент - базовый размер
        if not children:
            return {
                'group': group,
                'width': self.base_width,  # 240
                'height': self.base_height,  # 120
                'children': []
            }
        
        # Рекурсивно получаем размеры всех детей
        children_sizes = []
        total_children_width = 0
        max_child_height = 0
        
        for child in children:
            child_size = self._calculate_sizes_bottom_up(child)
            children_sizes.append(child_size)
            total_children_width += child_size['width']
            max_child_height = max(max_child_height, child_size['height'])
        
        # Добавляем отступы между детьми
        if len(children) > 1:
            total_children_width += (len(children) - 1) * self.min_child_spacing
        
        # Рассчитываем размер родителя
        parent_width = max(self.base_width, total_children_width + 2 * self.padding)
        parent_height = max(self.base_height, max_child_height + self.header_height + 2 * self.padding)
        
        return {
            'group': group,
            'width': parent_width,
            'height': parent_height,
            'children': children_sizes
        }
    
    def _calculate_positions_top_down(self, group, size_info, x, y, parent_id):
        """
        ПРОХОД 2: Рассчитывает абсолютные координаты сверху вниз
        """
        group_id = self.current_id
        self.current_id += 1
        
        layout = {
            'id': group_id,
            'name': group.name,
            'x': x,
            'y': y,
            'width': size_info['width'],
            'height': size_info['height'],
            'parent': parent_id,
            'children': []
        }
        
        # Если есть дети - рассчитываем их координаты
        if size_info['children']:
            # Первый ребенок размещается в (30,30) относительно родителя
            child_x = 30
            child_y = 30
            
            for child_size in size_info['children']:
                # Рекурсивно рассчитываем координаты ребенка
                child_layout = self._calculate_positions_top_down(
                    child_size['group'], 
                    child_size, 
                    child_x, 
                    child_y, 
                    group_id
                )
                layout['children'].append(child_layout)
                
                # Сдвигаем позицию для следующего ребенка (горизонтально)
                child_x += child_size['width'] + self.min_child_spacing
        
        return layout
    
    def _create_group_cell(self, group_info: Dict) -> ET.Element:
        """Создает XML элемент для группы"""
        # Определяем значения для отображения
        c4_name = group_info['name']
        c4_instances = 'n'  # По умолчанию
        c4_specifications = 'Type\nSpecifications'
        
        # Создаем object элемент
        object_elem = ET.Element('object', {
            'placeholders': '1',
            'c4Name': c4_name,
            'label': '<font style="font-size: 16px"><b><div style="text-align: left">%c4Name% x %c4Instances%</div></b></font><div style="text-align: left">[<span style="background-color: initial;">%c4Specifications%]</span></div>',
            'c4Instances': c4_instances,
            'c4Specifications': c4_specifications,
            'id': str(group_info['id'])
        })
        
        # Создаем mxCell элемент
        mx_cell = ET.SubElement(object_elem, 'mxCell', {
            'style': 'rounded=1;fontSize=11;whiteSpace=wrap;html=1;dashed=1;arcSize=20;fillColor=none;strokeColor=#06315C;fontColor=#000;labelBackgroundColor=none;align=left;verticalAlign=bottom;labelBorderColor=none;spacingTop=0;spacing=10;dashPattern=8 4;metaEdit=1;rotatable=0;perimeter=rectanglePerimeter;noLabel=0;labelPadding=0;allowArrows=0;;connectable=1;expand=0;recursiveResize=0;editable=1;pointerEvents=0;absoluteArcSize=1;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];strokeWidth=2;container=1;imageAlign=right;imageVerticalAlign=bottom;direction=east;collapsible=0;',
            'vertex': '1',
            'parent': str(group_info.get('parent', '1'))
        })
        
        # Создаем mxGeometry элемент
        ET.SubElement(mx_cell, 'mxGeometry', {
            'x': str(group_info['x']),
            'y': str(group_info['y']),
            'width': str(group_info['width']),
            'height': str(group_info['height']),
            'as': 'geometry'
        })
        
        return object_elem
    
    def _xml_to_string(self, root: ET.Element) -> str:
        """Преобразует XML элемент в строку с правильным форматированием"""
        # Добавляем XML декларацию
        xml_str = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml_str += ET.tostring(root, encoding='unicode')
        return xml_str 

    def _add_layout_to_xml(self, xml_root, layout):
        """
        Рекурсивно добавляет layout в XML структуру
        """
        # Добавляем текущий элемент
        group_cell = self._create_group_cell(layout)
        xml_root.append(group_cell)
        
        # Рекурсивно добавляем всех детей
        for child_layout in layout.get('children', []):
            self._add_layout_to_xml(xml_root, child_layout) 
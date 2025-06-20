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
    
    def _get_path_to_root(self, group):
        """
        Получает полный путь от корня до указанной группы
        Возвращает список групп от корня до указанной группы (включительно)
        """
        path = []
        current = group
        
        # Идем вверх по дереву до корня
        while current is not None:
            path.append(current)
            current = current.parent
        
        # Переворачиваем, чтобы путь был от корня к группе
        path.reverse()
        return path
    
    def _build_tree_with_parents(self, target_group):
        """
        Строит дерево, которое содержит:
        1. Полный путь от корня до target_group
        2. Все дочерние элементы target_group (полное поддерево)
        
        Возвращает корневую группу этого дерева с временно модифицированными children
        """
        # Получаем путь от корня до целевой группы
        path_to_target = self._get_path_to_root(target_group)
        
        if not path_to_target:
            return target_group
            
        # Корневая группа - это первый элемент пути
        root_group = path_to_target[0]
        
        # Сохраняем оригинальные children для восстановления потом
        self._original_children = {}
        
        # Для каждой группы в пути (кроме последней) оставляем только следующую в пути
        for i, group in enumerate(path_to_target[:-1]):
            # Сохраняем оригинальные children
            original_children = list(DdGroup.objects.filter(parent=group))
            self._original_children[group.id] = original_children
            
            # Следующая группа в пути
            next_group = path_to_target[i + 1]
            
            # Временно заменяем children на только следующую в пути
            group._filtered_children = [next_group]
        
        # Для целевой группы оставляем всех детей (полное поддерево)
        target_children = list(DdGroup.objects.filter(parent=target_group))
        self._original_children[target_group.id] = target_children
        target_group._filtered_children = target_children
        
        return root_group

    def export_dd_groups_to_drawio(self, root_group_id=None):
        """
        Экспортирует архитектуру в формат Draw.io
        """
        # Определяем какие группы экспортировать
        if root_group_id is None:
            # Экспортируем все корневые группы
            root_groups = list(DdGroup.objects.filter(parent=None))
        else:
            # Получаем целевую группу
            if isinstance(root_group_id, int):
                target_group = DdGroup.objects.get(id=root_group_id)
            else:
                target_group = root_group_id
            
            # Если это уже корневая группа - экспортируем как есть
            if target_group.parent is None:
                root_groups = [target_group]
            else:
                # Строим дерево с полным путем от корня
                filtered_root = self._build_tree_with_parents(target_group)
                root_groups = [filtered_root]
        
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
    
    def _calculate_optimal_layout(self, children_sizes):
        """
        Умный алгоритм размещения элементов в строки с анализом размеров
        Большие элементы размещаются в отдельных строках, маленькие группируются
        """
        if not children_sizes:
            return [], 0, 0
        
        # Сортируем элементы по убыванию площади
        sorted_children = sorted(children_sizes, key=lambda x: x['width'] * x['height'], reverse=True)
        
        # Определяем пороговую ширину - если элемент шире, он идет в отдельную строку
        max_width = max(child['width'] for child in sorted_children)
        width_threshold = max_width * 0.6  # 60% от самого широкого элемента
        
        # Группируем элементы по строкам
        rows = []
        
        for child in sorted_children:
            child_width = child['width']
            child_height = child['height']
            
            # Если элемент широкий - размещаем в отдельной строке
            if child_width >= width_threshold:
                rows.append({
                    'elements': [child],
                    'width': child_width,
                    'height': child_height,
                    'is_single': True
                })
            else:
                # Ищем строку, куда поместится маленький элемент
                placed = False
                max_row_width = 1200  # Максимальная ширина строки для маленьких элементов
                
                for row in rows:
                    if not row['is_single']:  # Только в строки с несколькими элементами
                        if row['width'] + self.min_child_spacing + child_width <= max_row_width:
                            row['elements'].append(child)
                            row['width'] += self.min_child_spacing + child_width
                            row['height'] = max(row['height'], child_height)
                            placed = True
                            break
                
                # Если не поместился - создаем новую строку для маленьких элементов
                if not placed:
                    rows.append({
                        'elements': [child],
                        'width': child_width,
                        'height': child_height,
                        'is_single': False
                    })
        
        # Преобразуем строки в позиции элементов
        positions = []
        current_y = 0
        total_width = 0
        
        for row in rows:
            current_x = 0
            
            for element in row['elements']:
                positions.append({
                    'element': element,
                    'x': current_x,
                    'y': current_y,
                    'width': element['width'],
                    'height': element['height']
                })
                current_x += element['width'] + self.min_child_spacing
            
            total_width = max(total_width, row['width'])
            current_y += row['height'] + self.min_child_spacing
        
        # Убираем лишний отступ снизу
        total_height = current_y - self.min_child_spacing if current_y > 0 else 0
        
        return positions, total_width, total_height
    
    def _calculate_grid_layout(self, num_children):
        """
        Рассчитывает оптимальную сетку для размещения элементов одинакового размера
        Returns: (cols, rows) - количество колонок и строк
        """
        if num_children <= 3:
            return (num_children, 1)  # Горизонтальная линия
        elif num_children == 4:
            return (2, 2)  # Квадрат 2x2
        elif num_children == 5:
            return (3, 2)  # 3 элемента в первой строке, 2 во второй
        elif num_children == 6:
            return (3, 2)  # Сетка 3x2
        else:
            # Для больших количеств стремимся к квадратной форме
            cols = int(num_children ** 0.5) + 1
            rows = (num_children + cols - 1) // cols  # Округление вверх
            return (cols, rows)

    def _should_use_bin_packing(self, children_sizes):
        """
        Определяет, нужно ли использовать bin packing или простую сетку
        Bin packing используется если:
        1. Элементы имеют разные размеры
        2. Есть элементы, которые значительно больше других
        """
        if not children_sizes:
            return False
        
        # Получаем размеры всех элементов
        sizes = [(child['width'], child['height']) for child in children_sizes]
        areas = [size[0] * size[1] for size in sizes]
        
        # Если все элементы одинакового размера - используем простую сетку
        first_size = sizes[0]
        all_same_size = all(size == first_size for size in sizes)
        
        if all_same_size:
            return False
        
        # Если есть элементы, которые в 2+ раза больше других - используем bin packing
        min_area = min(areas)
        max_area = max(areas)
        
        if max_area >= 2 * min_area:
            return True
        
        return False

    def _calculate_sizes_bottom_up(self, group):
        """
        ПРОХОД 1: Рассчитывает размеры всех элементов снизу вверх
        Возвращает словарь {group_id: {'width': w, 'height': h, 'children': [...]}}
        """
        # Используем отфильтрованные дети, если они есть, иначе обычные дети
        if hasattr(group, '_filtered_children'):
            children = group._filtered_children
        else:
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
        for child in children:
            child_size = self._calculate_sizes_bottom_up(child)
            children_sizes.append(child_size)
        
        # Выбираем алгоритм размещения
        if self._should_use_bin_packing(children_sizes):
            # Используем bin packing для элементов разного размера
            positions, content_width, content_height = self._calculate_optimal_layout(children_sizes)
            
            parent_width = max(self.base_width, content_width + 2 * self.padding)
            parent_height = max(self.base_height, content_height + self.header_height + 2 * self.padding)
            
            return {
                'group': group,
                'width': parent_width,
                'height': parent_height,
                'children': children_sizes,
                'positions': positions,  # Сохраняем рассчитанные позиции
                'content_width': content_width,
                'content_height': content_height,
                'layout_type': 'bin_packing'
            }
        else:
            # Используем простую сетку для элементов одинакового размера
            cols, rows = self._calculate_grid_layout(len(children))
            
            # Находим максимальные размеры среди детей (они все одинаковые)
            max_child_width = max(child['width'] for child in children_sizes)
            max_child_height = max(child['height'] for child in children_sizes)
            
            # Рассчитываем размер родителя на основе сетки
            total_width = cols * max_child_width + (cols - 1) * self.min_child_spacing
            total_height = rows * max_child_height + (rows - 1) * self.min_child_spacing
            
            parent_width = max(self.base_width, total_width + 2 * self.padding)
            parent_height = max(self.base_height, total_height + self.header_height + 2 * self.padding)
            
            return {
                'group': group,
                'width': parent_width,
                'height': parent_height,
                'children': children_sizes,
                'grid_cols': cols,
                'grid_rows': rows,
                'max_child_width': max_child_width,
                'max_child_height': max_child_height,
                'layout_type': 'grid'
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
        
        # Выбираем способ размещения детей в зависимости от типа layout
        if size_info['children']:
            layout_type = size_info.get('layout_type', 'grid')
            
            if layout_type == 'bin_packing':
                # Используем предрассчитанные позиции из bin packing
                for pos_info in size_info['positions']:
                    child_size = pos_info['element']
                    
                    # Рассчитываем абсолютные координаты (относительно родителя + отступ)
                    child_x = 30 + pos_info['x']
                    child_y = 30 + pos_info['y']
                    
                    # Рекурсивно рассчитываем координаты ребенка
                    child_layout = self._calculate_positions_top_down(
                        child_size['group'], 
                        child_size, 
                        child_x, 
                        child_y, 
                        group_id
                    )
                    layout['children'].append(child_layout)
            else:
                # Используем простую сетку
                cols = size_info.get('grid_cols', 1)
                max_child_width = size_info.get('max_child_width', self.base_width)
                max_child_height = size_info.get('max_child_height', self.base_height)
                
                for i, child_size in enumerate(size_info['children']):
                    # Определяем позицию в сетке
                    col = i % cols
                    row = i // cols
                    
                    # Рассчитываем координаты ребенка в сетке
                    child_x = 30 + col * (max_child_width + self.min_child_spacing)
                    child_y = 30 + row * (max_child_height + self.min_child_spacing)
                    
                    # Рекурсивно рассчитываем координаты ребенка
                    child_layout = self._calculate_positions_top_down(
                        child_size['group'], 
                        child_size, 
                        child_x, 
                        child_y, 
                        group_id
                    )
                    layout['children'].append(child_layout)
        
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
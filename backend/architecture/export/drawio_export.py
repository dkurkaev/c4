"""
Модуль для экспорта данных дерева DdGroup в формат drawio (XML)
"""

import xml.etree.ElementTree as ET
from typing import List, Dict, Tuple
from ..models import DdGroup, DdComponent
from .palette import DrawioPalette


class DrawioExporter:
    """Класс для экспорта дерева DdGroup в формат drawio"""
    
    def __init__(self):
        self.cell_id_counter = 2  # Начинаем с 2, так как 0 и 1 зарезервированы
        self.current_id = 2  # Для нового алгоритма
        
        # Получаем настройки из палитры
        self.dd_group_style = DrawioPalette.get_style('dd_group')
        self.spacing = DrawioPalette.get_default_spacing()
        
        # Устанавливаем размеры и отступы из палитры
        self.base_width = self.dd_group_style.width
        self.base_height = self.dd_group_style.height
        self.padding = self.dd_group_style.padding
        self.min_child_spacing = self.dd_group_style.min_spacing
        self.header_height = self.dd_group_style.header_height
        self.group_spacing = self.spacing['group_spacing']
    
    def _get_group_children(self, group):
        """
        Получает всех детей группы: подгруппы и компоненты
        Возвращает список объектов с указанием типа
        """
        children = []
        
        # Добавляем подгруппы
        subgroups = list(DdGroup.objects.filter(parent=group))
        for subgroup in subgroups:
            children.append({
                'type': 'group',
                'object': subgroup
            })
        
        # Добавляем компоненты
        components = list(DdComponent.objects.filter(group=group))
        for component in components:
            children.append({
                'type': 'component', 
                'object': component
            })
        
        return children
    
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
            original_children = self._get_group_children(group)
            self._original_children[group.id] = original_children
            
            # Следующая группа в пути
            next_group = path_to_target[i + 1]
            
            # Временно заменяем children на только следующую в пути
            group._filtered_children = [{'type': 'group', 'object': next_group}]
        
        # Для целевой группы оставляем всех детей (полное поддерево)
        target_children = self._get_group_children(target_group)
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
            start_x += group_layout['width'] + self.group_spacing
        
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
        # Используем отфильтрованные дети, если они есть, иначе получаем всех детей
        if hasattr(group, '_filtered_children'):
            children_data = group._filtered_children
        else:
            children_data = self._get_group_children(group)
        
        # Если это листовой элемент - базовый размер
        if not children_data:
            return {
                'element_type': 'group',
                'group': group,
                'width': self.base_width,  # 240
                'height': self.base_height,  # 120
                'children': []
            }
        
        # Рекурсивно получаем размеры всех детей
        children_sizes = []
        for child_data in children_data:
            if child_data['type'] == 'group':
                # Рекурсивно обрабатываем подгруппу
                child_size = self._calculate_sizes_bottom_up(child_data['object'])
                children_sizes.append(child_size)
            elif child_data['type'] == 'component':
                # Компонент имеет фиксированный размер
                component_style = DrawioPalette.get_component_style(child_data['object'])
                child_size = {
                    'element_type': 'component',
                    'component': child_data['object'],
                    'width': component_style.width,
                    'height': component_style.height,
                    'children': []  # У компонентов нет детей
                }
                children_sizes.append(child_size)
        
        # Выбираем алгоритм размещения
        if self._should_use_bin_packing(children_sizes):
            # Используем bin packing для элементов разного размера
            positions, content_width, content_height = self._calculate_optimal_layout(children_sizes)
            
            parent_width = max(self.base_width, content_width + 2 * self.padding)
            parent_height = max(self.base_height, content_height + self.header_height + 2 * self.padding)
            
            return {
                'element_type': 'group',
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
            cols, rows = self._calculate_grid_layout(len(children_sizes))
            
            # Находим максимальные размеры среди детей (они все одинаковые)
            max_child_width = max(child['width'] for child in children_sizes)
            max_child_height = max(child['height'] for child in children_sizes)
            
            # Рассчитываем размер родителя на основе сетки
            total_width = cols * max_child_width + (cols - 1) * self.min_child_spacing
            total_height = rows * max_child_height + (rows - 1) * self.min_child_spacing
            
            parent_width = max(self.base_width, total_width + 2 * self.padding)
            parent_height = max(self.base_height, total_height + self.header_height + 2 * self.padding)
            
            return {
                'element_type': 'group',
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
        # Проверяем тип элемента
        if size_info.get('element_type') == 'component':
            # Для компонента просто возвращаем его информацию
            component_id = self.current_id
            self.current_id += 1
            
            return {
                'id': component_id,
                'element_type': 'component',
                'component': size_info['component'],
                'name': size_info['component'].name,
                'x': x,
                'y': y,
                'width': size_info['width'],
                'height': size_info['height'],
                'parent': parent_id,
                'children': []
            }
        
        # Для группы
        group_id = self.current_id
        self.current_id += 1
        
        layout = {
            'id': group_id,
            'element_type': 'group',
            'group': group,
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
                    if child_size.get('element_type') == 'component':
                        child_layout = self._calculate_positions_top_down(
                            None,  # Для компонента group не нужен
                            child_size, 
                            child_x, 
                            child_y, 
                            group_id
                        )
                    else:
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
                    if child_size.get('element_type') == 'component':
                        child_layout = self._calculate_positions_top_down(
                            None,  # Для компонента group не нужен
                            child_size, 
                            child_x, 
                            child_y, 
                            group_id
                        )
                    else:
                        child_layout = self._calculate_positions_top_down(
                            child_size['group'], 
                            child_size, 
                            child_x, 
                            child_y, 
                            group_id
                        )
                    layout['children'].append(child_layout)
        
        return layout
    
    def _create_component_cell(self, component_info: Dict) -> ET.Element:
        """Создает XML элемент для компонента"""
        component = component_info['component']
        component_style = DrawioPalette.get_component_style(component)
        
        # Определяем значения для отображения
        c4_name = component.name
        c4_type = component.type.name if component.type else 'Component'
        c4_technology = component.technology or 'Technology'
        c4_description = component.description or 'Description'
        
        # Создаем object элемент
        object_elem = ET.Element('object', {
            'placeholders': '1',
            'c4Name': c4_name,
            'c4Type': c4_type,
            'c4Technology': c4_technology,
            'c4Description': c4_description,
            'label': component_style.label_template,
            'id': str(component_info['id'])
        })
        
        # Создаем mxCell элемент с стилем из палитры
        mx_cell = ET.SubElement(object_elem, 'mxCell', {
            'style': component_style.style,
            'vertex': '1',
            'parent': str(component_info.get('parent', '1'))
        })
        
        # Создаем mxGeometry элемент
        ET.SubElement(mx_cell, 'mxGeometry', {
            'x': str(component_info['x']),
            'y': str(component_info['y']),
            'width': str(component_info['width']),
            'height': str(component_info['height']),
            'as': 'geometry'
        })
        
        return object_elem
    
    def _create_group_cell(self, group_info: Dict) -> ET.Element:
        """Создает XML элемент для группы"""
        # Получаем объект группы из layout info
        if 'group' in group_info:
            group = group_info['group']
        else:
            # Fallback - пытаемся найти группу по имени (не должно происходить)
            group = None
        
        # Определяем значения для отображения
        c4_name = group_info['name'] if group_info.get('name') else 'Unknown'
        
        # Логика для экземпляров: если None или пусто -> "1", если 0 -> "n", иначе -> значение
        if group and hasattr(group, 'instances'):
            if group.instances is None or group.instances == '':
                c4_instances = '1'
            elif group.instances == 0:
                c4_instances = 'n'
            else:
                c4_instances = str(group.instances)
        else:
            c4_instances = '1'  # По умолчанию
        
        # Формируем спецификации
        if group:
            type_name = group.type.name if group.type else 'Unknown Type'
            specification = group.specification if group.specification else ''
            
            if specification.strip():  # Если спецификация не пустая
                c4_specifications = f"{type_name}\n{specification}"
            else:  # Если спецификация пустая - только тип в квадратных скобках
                c4_specifications = f"{type_name}"
        else:
            c4_specifications = 'Unknown Type'
        
        # Создаем object элемент
        object_elem = ET.Element('object', {
            'placeholders': '1',
            'c4Name': c4_name,
            'label': self.dd_group_style.label_template,
            'c4Instances': c4_instances,
            'c4Specifications': c4_specifications,
            'id': str(group_info['id'])
        })
        
        # Создаем mxCell элемент с стилем из палитры
        mx_cell = ET.SubElement(object_elem, 'mxCell', {
            'style': self.dd_group_style.style,
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
        # Добавляем текущий элемент в зависимости от типа
        if layout.get('element_type') == 'component':
            element_cell = self._create_component_cell(layout)
        else:
            element_cell = self._create_group_cell(layout)
            
        xml_root.append(element_cell)
        
        # Рекурсивно добавляем всех детей
        for child_layout in layout.get('children', []):
            self._add_layout_to_xml(xml_root, child_layout)

    def export_element_to_drawio(self, element_id: int, element_type: str):
        """
        Экспортирует элемент (группу или компонент) в формат Draw.io
        
        Args:
            element_id: ID элемента
            element_type: тип элемента ('ddgroup' или 'ddcomponent')
        """
        if element_type == 'ddgroup':
            # Экспортируем группу - используем существующий метод
            return self.export_dd_groups_to_drawio(element_id)
        elif element_type == 'ddcomponent':
            # Экспортируем компонент - нужно найти его родительскую группу
            component = DdComponent.objects.get(id=element_id)
            if component.group:
                # Экспортируем группу, содержащую этот компонент
                return self.export_dd_groups_to_drawio(component.group.id)
            else:
                # Компонент без группы - создаем минимальную диаграмму только с компонентом
                return self._export_standalone_component(component)
        else:
            raise ValueError(f"Неподдерживаемый тип элемента: {element_type}")

    def _export_standalone_component(self, component):
        """
        Экспортирует отдельный компонент без группы
        """
        # Создаем корневую структуру XML
        root = self._create_xml_structure()
        
        # Получаем корневой элемент для добавления компонента
        mxgraph_model = root.find('.//mxGraphModel')
        mxgraph_root = mxgraph_model.find('root')
        
        # Создаем layout для компонента
        component_style = DrawioPalette.get_component_style(component)
        component_layout = {
            'id': self.current_id,
            'element_type': 'component',
            'component': component,
            'name': component.name,
            'x': 0,
            'y': 0,
            'width': component_style.width,
            'height': component_style.height,
            'parent': '1',
            'children': []
        }
        self.current_id += 1
        
        # Добавляем компонент в XML
        self._add_layout_to_xml(mxgraph_root, component_layout)
        
        return self._xml_to_string(root)

    def export_multiple_elements_to_drawio(self, elements: List[dict]):
        """
        Экспортирует несколько элементов в формат Draw.io
        
        Args:
            elements: список элементов в формате [{"id": 1, "type": "ddgroup"}, {"id": 2, "type": "ddcomponent"}]
        """
        # Создаем корневую структуру XML
        root = self._create_xml_structure()
        
        # Получаем корневой элемент для добавления элементов
        mxgraph_model = root.find('.//mxGraphModel')
        mxgraph_root = mxgraph_model.find('root')
        
        # Обрабатываем каждый элемент
        start_x = 0
        for element_info in elements:
            element_id = element_info['id']
            element_type = element_info['type']
            
            if element_type == 'ddgroup':
                # Экспортируем группу
                group = DdGroup.objects.get(id=element_id)
                group_layout = self._calculate_group_layout(group, start_x, 0)
                self._add_layout_to_xml(mxgraph_root, group_layout)
                start_x += group_layout['width'] + self.group_spacing
                
            elif element_type == 'ddcomponent':
                # Экспортируем компонент
                component = DdComponent.objects.get(id=element_id)
                component_style = DrawioPalette.get_component_style(component)
                
                component_layout = {
                    'id': self.current_id,
                    'element_type': 'component',
                    'component': component,
                    'name': component.name,
                    'x': start_x,
                    'y': 0,
                    'width': component_style.width,
                    'height': component_style.height,
                    'parent': '1',
                    'children': []
                }
                self.current_id += 1
                
                self._add_layout_to_xml(mxgraph_root, component_layout)
                start_x += component_style.width + self.group_spacing
        
        return self._xml_to_string(root) 
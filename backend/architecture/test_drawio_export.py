#!/usr/bin/env python
"""
Тестовый скрипт для проверки экспорта DD групп в формат drawio
"""

import os
import sys
import django

# Настройка Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'c4drawer.settings')
django.setup()

from architecture.models import DdGroup, DdGroupType
from architecture.drawio_export import DrawioExporter


def test_export():
    """Тестирует экспорт в drawio формат"""
    
    print("Проверка существующих данных...")
    
    # Получаем реальные корневые группы из базы
    root_groups = list(DdGroup.objects.filter(parent=None))
    
    if not root_groups:
        print("В базе нет корневых групп! Завершаю тест.")
        return
    
    print(f"Найдено {len(root_groups)} корневых групп:")
    for group in root_groups:
        print(f"  - {group.name} (ID: {group.id})")
    
    print("\nЭкспорт в drawio формат...")
    exporter = DrawioExporter()
    
    # Тест 1: Экспорт всех корневых групп
    print("Тест 1: Экспорт всех корневых групп")  
    xml_content = exporter.export_dd_groups_to_drawio()
    
    # Сохраняем результат в файл
    with open('test_export_all.drawio', 'w', encoding='utf-8') as f:
        f.write(xml_content)
    print("Результат сохранен в test_export_all.drawio")
    
    # Тест 2: Экспорт группы с id 12
    target_group_id = 12
    try:
        target_group = DdGroup.objects.get(id=target_group_id)
        print(f"Тест 2: Экспорт группы '{target_group.name}' (ID: {target_group.id})")
        print(f"  Путь к группе: {' -> '.join([g.name for g in get_path_to_root(target_group)])}")
        
        xml_content = exporter.export_dd_groups_to_drawio(target_group_id)
        
        # Сохраняем результат в файл
        with open(f'test_export_group_{target_group_id}.drawio', 'w', encoding='utf-8') as f:
            f.write(xml_content)
        print(f"Результат сохранен в test_export_group_{target_group_id}.drawio")
        
    except DdGroup.DoesNotExist:
        print(f"Группа с ID {target_group_id} не найдена в базе данных!")
        print("Доступные группы:")
        all_groups = DdGroup.objects.all()
        for group in all_groups:
            parent_name = group.parent.name if group.parent else "ROOT"
            print(f"  - ID: {group.id}, Name: {group.name}, Parent: {parent_name}")
    
    print("Тестирование завершено успешно!")


def get_path_to_root(group):
    """Получает путь от корня до указанной группы"""
    path = []
    current = group
    
    while current is not None:
        path.append(current)
        current = current.parent
    
    path.reverse()
    return path


if __name__ == "__main__":
    test_export() 
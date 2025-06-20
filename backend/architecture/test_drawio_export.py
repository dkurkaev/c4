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
    
    # Тест 2: Экспорт первой группы
    first_group = root_groups[0]
    print(f"Тест 2: Экспорт группы '{first_group.name}' (ID: {first_group.id})")
    xml_content = exporter.export_dd_groups_to_drawio(first_group.id)
    
    # Сохраняем результат в файл
    with open(f'test_export_group_{first_group.id}.drawio', 'w', encoding='utf-8') as f:
        f.write(xml_content)
    print(f"Результат сохранен в test_export_group_{first_group.id}.drawio")
    
    print("Тестирование завершено успешно!")


if __name__ == "__main__":
    test_export() 
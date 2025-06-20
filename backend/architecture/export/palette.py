"""
Палитра визуальных настроек для элементов диаграммы
"""

from typing import Dict, Any


class ElementStyle:
    """Класс для хранения стиля элемента"""
    
    def __init__(self, 
                 width: int, 
                 height: int,
                 style: str,
                 label_template: str,
                 padding: int = 30,
                 header_height: int = 50,
                 min_spacing: int = 30):
        self.width = width
        self.height = height
        self.style = style
        self.label_template = label_template
        self.padding = padding
        self.header_height = header_height
        self.min_spacing = min_spacing


class DrawioPalette:
    """Палитра стилей для экспорта в Draw.io"""
    
    # Стили для разных типов элементов
    STYLES = {
        'dd_group': ElementStyle(
            width=240,
            height=120,
            style='rounded=1;fontSize=11;whiteSpace=wrap;html=1;dashed=1;arcSize=20;fillColor=none;strokeColor=#06315C;fontColor=#000;labelBackgroundColor=none;align=left;verticalAlign=bottom;labelBorderColor=none;spacingTop=0;spacing=10;dashPattern=8 4;metaEdit=1;rotatable=0;perimeter=rectanglePerimeter;noLabel=0;labelPadding=0;allowArrows=0;;connectable=1;expand=0;recursiveResize=0;editable=1;pointerEvents=0;absoluteArcSize=1;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];strokeWidth=2;container=1;imageAlign=right;imageVerticalAlign=bottom;direction=east;collapsible=0;',
            label_template='<font style="font-size: 16px"><b><div style="text-align: left">%c4Name% x %c4Instances%</div></b></font><div style="text-align: left">[<span style="background-color: initial;">%c4Specifications%]</span></div>',
            padding=30,
            header_height=50,
            min_spacing=30
        ),
        
        # Заготовки для будущих типов элементов
        'component': ElementStyle(
            width=200,
            height=100,
            style='rounded=1;fontSize=11;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontColor=#000;',
            label_template='<font style="font-size: 14px"><b>%name%</b></font><div>[%type%]</div>',
            padding=20,
            header_height=40,
            min_spacing=20
        ),
        
        'service': ElementStyle(
            width=180,
            height=80,
            style='rounded=1;fontSize=11;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontColor=#000;',
            label_template='<font style="font-size: 14px"><b>%name%</b></font><div>[Service]</div>',
            padding=15,
            header_height=35,
            min_spacing=15
        )
    }
    
    @classmethod
    def get_style(cls, element_type: str) -> ElementStyle:
        """Получает стиль для указанного типа элемента"""
        return cls.STYLES.get(element_type, cls.STYLES['dd_group'])
    
    @classmethod
    def get_default_spacing(cls) -> Dict[str, int]:
        """Получает настройки отступов по умолчанию"""
        return {
            'padding': 30,
            'header_height': 50,
            'min_child_spacing': 30,
            'group_spacing': 100  # Расстояние между корневыми группами
        } 
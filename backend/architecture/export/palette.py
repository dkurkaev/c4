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
        
        'dd_component': ElementStyle(
            width=240,
            height=120,
            style='rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#23A2D9;fontColor=#ffffff;align=center;arcSize=6;strokeColor=#0E7DAD;metaEdit=1;resizable=1;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];fontSize=14;strokeWidth=3;allowArrows=0;rotatable=0;',
            label_template='<font style="font-size: 16px"><b>%c4Name%</b></font><div>[%c4Type%: %c4Technology%]</div><br><div><font style="font-size: 11px">%c4Description%</font></div>',
            padding=0,  # Компоненты не имеют детей, отступы не нужны
            header_height=0,
            min_spacing=0
        ),
        
        'dd_component_database': ElementStyle(
            width=240,
            height=120,
            style='shape=cylinder3;size=15;whiteSpace=wrap;html=1;boundedLbl=1;rounded=0;labelBackgroundColor=none;fillColor=#23A2D9;fontSize=14;fontColor=#fff;align=center;strokeColor=#0E7DAD;metaEdit=1;points=[[0,0.25,0,0,0],[0,0.5,0,0,0],[0,0.75,0,0,0],[0.25,0.01,0,0,0],[0.25,0.99,0,0,0],[0.5,0,0,0,0],[0.5,1,0,0,0],[0.75,0.01,0,0,0],[0.75,0.99,0,0,0],[1,0.25,0,0,0],[1,0.5,0,0,0],[1,0.75,0,0,0]];resizable=1;strokeWidth=3;allowArrows=0;verticalAlign=middle;spacing=3;rotatable=0;',
            label_template='<b>%c4Name%</b><div>[%c4Type%: %c4Technology%]</div><br><div>%c4Description%</div>',
            padding=0,
            header_height=0,
            min_spacing=0
        ),
        
        'dd_component_file_storage': ElementStyle(
            width=240,
            height=120,
            style='html=1;verticalLabelPosition=middle;align=center;labelBackgroundColor=none;verticalAlign=middle;strokeWidth=3;strokeColor=#0E7DAD;shadow=0;dashed=0;shape=stencil(zVbbjoMgEP0aHk1Q1u72senlP1illSwFA24vf7/I6G5prUHdpk1MdM7IMMdDjoPI0hS0ZCjB1JQsqxBZoSQ5UM3pp7BwYjMFgLMUQkn3DJCNEjnTgJpKqy925HnVvM5lwTSvIHsELMa4jska4YVF64ssMyWl3ZkraRy2ucpvlWY7rb5l7iXadEnrHW8SbXqvDjW7EzSAoZ0zRG8QXW/pF6A6sw+C6h2L7HO0FXTnFdNN7ebz6LMXmiNj5cWiGGB/zSmiJ24irSpaf4euXnFIr4LLC7JjKjyU7QC6QdL4dOfpi4nbnPYgvvEIfX/rNzVmz1d4Hq5waydDGKcjKjyUb7jAYeJkQhl29y2ytPgdv7M+yYUAF+4pMMgtp1sQeTULIg+1oOT5FoQ9ugMOaK82/3DyLgcEOxD8DQpx/8Y5NQXr+vW7C3d2endN20amhLKDC4a7awPZw7p+Xy1W/e1MGDc+plt8b4kJIrmlN4OWQ2E+dMAP);fillColor=#23A2D9;fontColor=#fff;rounded=1;allowArrows=0;fontSize=14;arcSize=6;labelPosition=center;fontFamily=Helvetica;metaEdit=1;spacingTop=12;spacing=8;whiteSpace=wrap;resizable=1;points=[[0,0.25,0,0,0],[0,0.5,0,0,0],[0,0.75,0,0,0],[0.25,0,0,0,0],[0.25,1,0,0,0],[0.5,0.06,0,0,0],[0.5,1,0,0,0],[0.75,0.06,0,0,0],[0.75,1,0,0,0],[1,0.25,0,0,0],[1,0.5,0,0,0],[1,0.75,0,0,0]];rotatable=0;',
            label_template='<b>%c4Name%</b><div>[%c4Type%: %c4Technology%]</div><br><div>%c4Description%</div>',
            padding=0,
            header_height=0,
            min_spacing=0
        ),
        
        'dd_component_message_broker': ElementStyle(
            width=240,
            height=120,
            style='shape=cylinder3;size=15;direction=south;whiteSpace=wrap;html=1;boundedLbl=1;rounded=0;labelBackgroundColor=none;fillColor=#23A2D9;fontSize=14;fontColor=#fff;align=center;strokeColor=#0E7DAD;metaEdit=1;resizable=1;strokeWidth=3;allowArrows=0;verticalAlign=middle;points=[[0,0,0,0,67.5],[0,0,0,0,172.5],[0,0.5,0,0,0],[0.145,0,0,0,4.35],[0.145,1,0,0,-4.35],[0.5,0,0,0,0],[0.5,1,0,0,0],[0.855,0,0,0,4.35],[0.855,1,0,0,-4.35],[1,0,0,0,67.5],[1,0,0,0,172.5],[1,0.5,0,0,0]];rotatable=0;',
            label_template='<b>%c4Name%</b><div>[%c4Type%: %c4Technology%]</div><br><div>%c4Description%</div>',
            padding=0,
            header_height=0,
            min_spacing=0
        ),
        
        'dd_component_application': ElementStyle(
            width=240,
            height=120,
            style='rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#1061B0;fontColor=#fff;align=center;arcSize=10;strokeColor=#0D5091;metaEdit=1;resizable=1;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];fontSize=10;strokeWidth=3;verticalAlign=top;allowArrows=0;container=1;collapsible=0;recursiveResize=0;rotatable=0;',
            label_template='<font style="font-size: 16px;"><b>%c4Name%</b></font><div style="font-size: 14px;">[Application]</div><br style="font-size: 14px;"><div style="font-size: 14px;"><font style="font-size: 11px;">%c4Description%</font></div>',
            padding=0,
            header_height=0,
            min_spacing=0
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
    def get_component_style(cls, component) -> ElementStyle:
        """Получает стиль для компонента в зависимости от его типа"""
        if component.type and component.type.name:
            type_name = component.type.name.lower()
            
            # Типы базы данных
            database_types = ['database', 'rdbms', 'in-memory db', 'column-oriented db']
            if type_name in database_types:
                return cls.STYLES.get('dd_component_database', cls.STYLES['dd_component'])
            
            # Типы файлового хранилища
            file_storage_types = ['file storage']
            if type_name in file_storage_types:
                return cls.STYLES.get('dd_component_file_storage', cls.STYLES['dd_component'])
            
            # Типы брокеров сообщений
            message_broker_types = ['message broker']
            if type_name in message_broker_types:
                return cls.STYLES.get('dd_component_message_broker', cls.STYLES['dd_component'])
            
            # Типы приложений
            application_types = ['application']
            if type_name in application_types:
                return cls.STYLES.get('dd_component_application', cls.STYLES['dd_component'])
        
        # По умолчанию возвращаем обычный стиль компонента
        return cls.STYLES['dd_component']
    
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
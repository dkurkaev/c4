from django.db import models

# Create your models here.

class ComponentType(models.Model):
    """Тип компонента"""
    name = models.CharField(max_length=255, verbose_name="Название")
    
    class Meta:
        verbose_name = "Тип компонента"
        verbose_name_plural = "Типы компонентов"
    
    def __str__(self):
        return self.name


class OperationType(models.Model):
    """Тип операции"""
    name = models.CharField(max_length=255, verbose_name="Название")
    
    class Meta:
        verbose_name = "Тип операции"
        verbose_name_plural = "Типы операций"
    
    def __str__(self):
        return self.name


class InfoObject(models.Model):
    """Информационный объект"""
    name = models.CharField(max_length=255, verbose_name="Название")
    
    class Meta:
        verbose_name = "Информационный объект"
        verbose_name_plural = "Информационные объекты"
    
    def __str__(self):
        return self.name


class DdGroupType(models.Model):
    """Тип группы DD (Deployment Diagram)"""
    name = models.CharField(max_length=255, verbose_name="Название")
    
    class Meta:
        verbose_name = "Тип группы DD"
        verbose_name_plural = "Типы групп DD"
    
    def __str__(self):
        return self.name


class DdGroup(models.Model):
    """Группа DD (Deployment Diagram)"""
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        verbose_name="Родительская группа"
    )
    name = models.CharField(max_length=255, verbose_name="Название")
    type = models.ForeignKey(
        DdGroupType, 
        on_delete=models.CASCADE, 
        verbose_name="Тип"
    )
    instances = models.IntegerField(
        default=1, 
        null=True, 
        blank=True, 
        verbose_name="Количество экземпляров"
    )
    specification = models.TextField(blank=True, verbose_name="Спецификация")
    
    class Meta:
        verbose_name = "Группа DD"
        verbose_name_plural = "Группы DD"
    
    def __str__(self):
        return self.name


class C2GroupType(models.Model):
    """Тип группы C2 (Container Diagram)"""
    name = models.CharField(max_length=255, verbose_name="Название")
    
    class Meta:
        verbose_name = "Тип группы C2"
        verbose_name_plural = "Типы групп C2"
    
    def __str__(self):
        return self.name


class C2Group(models.Model):
    """Группа C2 (Container Diagram)"""
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        verbose_name="Родительская группа"
    )
    name = models.CharField(max_length=255, verbose_name="Название")
    type = models.ForeignKey(
        C2GroupType, 
        on_delete=models.CASCADE, 
        verbose_name="Тип"
    )
    
    class Meta:
        verbose_name = "Группа C2"
        verbose_name_plural = "Группы C2"
    
    def __str__(self):
        return self.name


class C2Component(models.Model):
    """Компонент C2 (Container Diagram)"""
    name = models.CharField(max_length=255, verbose_name="Название")
    type = models.ForeignKey(
        ComponentType, 
        on_delete=models.CASCADE, 
        verbose_name="Тип"
    )
    technology = models.CharField(max_length=255, blank=True, verbose_name="Технология")
    description = models.TextField(blank=True, verbose_name="Описание")
    group = models.ForeignKey(
        C2Group, 
        on_delete=models.CASCADE, 
        verbose_name="Группа"
    )
    is_external = models.BooleanField(default=False, verbose_name="Внешний")
    
    class Meta:
        verbose_name = "Компонент C2"
        verbose_name_plural = "Компоненты C2"
    
    def __str__(self):
        return self.name


class DdComponent(models.Model):
    """Компонент DD (Deployment Diagram)"""
    name = models.CharField(max_length=255, verbose_name="Название")
    c2_component = models.ForeignKey(
        C2Component, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        verbose_name="Компонент C2"
    )
    type = models.ForeignKey(
        ComponentType, 
        on_delete=models.CASCADE, 
        verbose_name="Тип"
    )
    technology = models.CharField(max_length=255, blank=True, verbose_name="Технология")
    description = models.TextField(blank=True, verbose_name="Описание")
    group = models.ForeignKey(
        DdGroup, 
        on_delete=models.CASCADE, 
        verbose_name="Группа"
    )
    is_external = models.BooleanField(default=False, verbose_name="Внешний")
    
    class Meta:
        verbose_name = "Компонент DD"
        verbose_name_plural = "Компоненты DD"
    
    def __str__(self):
        return self.name


class DdLinkProtocol(models.Model):
    """Протокол связи DD"""
    name = models.CharField(max_length=255, unique=True, verbose_name="Название")
    
    class Meta:
        verbose_name = "Протокол связи DD"
        verbose_name_plural = "Протоколы связей DD"
    
    def __str__(self):
        return self.name


class DdLink(models.Model):
    """Связь DD (Deployment Diagram)"""
    group_from = models.ForeignKey(
        DdGroup, 
        on_delete=models.CASCADE, 
        related_name='outgoing_links',
        verbose_name="Группа источник"
    )
    group_to = models.ForeignKey(
        DdGroup, 
        on_delete=models.CASCADE, 
        related_name='incoming_links',
        verbose_name="Группа назначение"
    )
    protocol = models.ForeignKey(
        DdLinkProtocol,
        on_delete=models.CASCADE,
        verbose_name="Протокол"
    )
    
    class Meta:
        verbose_name = "Связь DD"
        verbose_name_plural = "Связи DD"
    
    def __str__(self):
        return f"{self.group_from} -> {self.group_to} ({self.protocol})"


class DdLinkPort(models.Model):
    """Порты для связи DD"""
    dd_link = models.ForeignKey(
        DdLink,
        on_delete=models.CASCADE,
        related_name='ports',
        verbose_name="Связь DD"
    )
    port = models.IntegerField(verbose_name="Порт")

    
    class Meta:
        verbose_name = "Порт связи DD"
        verbose_name_plural = "Порты связей DD"
        unique_together = ['dd_link', 'port']
    
    def __str__(self):
        return f"{self.dd_link} - порт {self.port}"


class C2Link(models.Model):
    """Связь C2 (Container Diagram)"""
    component_from = models.ForeignKey(
        C2Component, 
        on_delete=models.CASCADE, 
        related_name='outgoing_links',
        verbose_name="Компонент источник"
    )
    component_to = models.ForeignKey(
        C2Component, 
        on_delete=models.CASCADE, 
        related_name='incoming_links',
        verbose_name="Компонент назначение"
    )
    name = models.CharField(max_length=255, blank=True, verbose_name="Название")
    technology = models.CharField(max_length=255, blank=True, verbose_name="Технология")
    format = models.CharField(max_length=255, blank=True, verbose_name="Формат")
    
    class Meta:
        verbose_name = "Связь C2"
        verbose_name_plural = "Связи C2"
    
    def __str__(self):
        return f"{self.component_from} -> {self.component_to}"


class C2LinksInfoObjects(models.Model):
    """Связь между C2 связями и информационными объектами"""
    c2_link = models.ForeignKey(
        C2Link, 
        on_delete=models.CASCADE, 
        verbose_name="Связь C2"
    )
    infoobject = models.ForeignKey(
        InfoObject, 
        on_delete=models.CASCADE, 
        verbose_name="Информационный объект"
    )
    operation_type = models.ForeignKey(
        OperationType, 
        on_delete=models.CASCADE, 
        verbose_name="Тип операции"
    )
    
    class Meta:
        verbose_name = "Связь C2 - Информационный объект"
        verbose_name_plural = "Связи C2 - Информационные объекты"
        unique_together = ['c2_link', 'infoobject', 'operation_type']
    
    def __str__(self):
        return f"{self.c2_link} - {self.infoobject} ({self.operation_type})"

"""
URL configuration for c4drawer project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from architecture.api import router as architecture_router

# Создаем экземпляр NinjaAPI
api = NinjaAPI(
    title="C4 Architecture API",
    description="API для работы с архитектурой в нотации C4",
    version="1.0.0"
)

# Подключаем роутеры
api.add_router("/architecture/", architecture_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]

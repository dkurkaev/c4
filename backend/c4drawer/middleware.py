from django.http import HttpResponsePermanentRedirect
from django.urls import resolve, Resolver404
from django.utils.deprecation import MiddlewareMixin


class SlashMiddleware(MiddlewareMixin):
    """Middleware для обработки URL со слешем и без него"""
    
    def process_request(self, request):
        # Получаем путь
        path = request.path_info
        
        # Если путь заканчивается на слеш, пробуем без слеша
        if path.endswith('/') and len(path) > 1:
            path_without_slash = path[:-1]
            try:
                resolve(path_without_slash)
                # Если роут найден без слеша, изменяем path_info
                request.path_info = path_without_slash
                request.path = path_without_slash
                return None
            except Resolver404:
                pass
        
        # Если путь не заканчивается на слеш, пробуем со слешем
        elif not path.endswith('/'):
            path_with_slash = path + '/'
            try:
                resolve(path_with_slash)
                # Если роут найден со слешем, изменяем path_info
                request.path_info = path_with_slash
                request.path = path_with_slash
                return None
            except Resolver404:
                pass
        
        return None 
# C4 Architecture Repository

Приложение-репозиторий для работы с архитектурой в нотации C4. Построено на Django + NinjaAPI + PostgreSQL.

## Особенности

- Полная поддержка моделей C4 (Container Diagram и Deployment Diagram)
- REST API с автоматической документацией
- Админка Django для управления данными
- Поддержка PostgreSQL
- CORS для фронтенда

## Установка и запуск

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Настройка базы данных

Создайте файл `.env` со следующими параметрами:

```
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_NAME=c4_main_db
DATABASE_USER=dkurkaev
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### 3. Создание и применение миграций

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Создание суперпользователя

```bash
python manage.py createsuperuser
```

### 5. Запуск сервера

```bash
python manage.py runserver
```

## API Endpoints

Сервер будет доступен по адресу: `http://localhost:8000`

### Основные эндпоинты:

- **API документация**: `http://localhost:8000/api/docs`
- **Django админка**: `http://localhost:8000/admin/`

### API маршруты:

#### Типы компонентов
- `GET /api/architecture/component-types/` - Список всех типов компонентов
- `POST /api/architecture/component-types/` - Создать новый тип компонента
- `GET /api/architecture/component-types/{id}/` - Получить тип компонента по ID
- `PUT /api/architecture/component-types/{id}/` - Обновить тип компонента
- `DELETE /api/architecture/component-types/{id}/` - Удалить тип компонента

#### Типы операций
- `GET /api/architecture/operation-types/` - Список всех типов операций
- `POST /api/architecture/operation-types/` - Создать новый тип операции
- `GET /api/architecture/operation-types/{id}/` - Получить тип операции по ID
- `PUT /api/architecture/operation-types/{id}/` - Обновить тип операции
- `DELETE /api/architecture/operation-types/{id}/` - Удалить тип операции

#### Информационные объекты
- `GET /api/architecture/info-objects/` - Список всех информационных объектов
- `POST /api/architecture/info-objects/` - Создать новый информационный объект
- `GET /api/architecture/info-objects/{id}/` - Получить информационный объект по ID
- `PUT /api/architecture/info-objects/{id}/` - Обновить информационный объект
- `DELETE /api/architecture/info-objects/{id}/` - Удалить информационный объект

#### DD (Deployment Diagram) Группы
- `GET /api/architecture/dd-group-types/` - Типы групп DD
- `GET /api/architecture/dd-groups/` - Группы DD
- `POST /api/architecture/dd-groups/` - Создать новую группу DD
- И другие CRUD операции...

#### C2 (Container Diagram) Компоненты
- `GET /api/architecture/c2-group-types/` - Типы групп C2
- `GET /api/architecture/c2-groups/` - Группы C2
- `GET /api/architecture/c2-components/` - Компоненты C2
- И другие CRUD операции...

#### DD Компоненты
- `GET /api/architecture/dd-components/` - Компоненты DD
- `POST /api/architecture/dd-components/` - Создать новый компонент DD
- И другие CRUD операции...

#### Связи
- `GET /api/architecture/dd-link-protocols/` - Протоколы связи DD
- `GET /api/architecture/dd-links/` - Связи DD
- `GET /api/architecture/c2-links/` - Связи C2
- `GET /api/architecture/c2-links-info-objects/` - Связи C2 с информационными объектами

## Структура моделей

### Основные модели:

1. **ComponentType** - Типы компонентов
2. **OperationType** - Типы операций
3. **InfoObject** - Информационные объекты

### DD (Deployment Diagram) модели:

4. **DdGroupType** - Типы групп DD
5. **DdGroup** - Группы DD (с поддержкой иерархии)
6. **DdComponent** - Компоненты DD
7. **DdLinkProtocol** - Протоколы связи DD
8. **DdLink** - Связи между группами DD

### C2 (Container Diagram) модели:

9. **C2GroupType** - Типы групп C2
10. **C2Group** - Группы C2 (с поддержкой иерархии)
11. **C2Component** - Компоненты C2
12. **C2Link** - Связи между компонентами C2
13. **C2LinksInfoObjects** - Связи C2 с информационными объектами

## Доступ к админке

- URL: `http://localhost:8000/admin/`
- Логин: `admin`
- Пароль: `admin123`

## Технологический стек

- **Backend**: Django 4.2.16
- **API**: Django Ninja 1.1.0
- **База данных**: PostgreSQL
- **ORM**: Django ORM
- **Документация API**: Автоматическая через Django Ninja

## Следующие шаги

1. Добавить валидацию данных
2. Реализовать экспорт в различные форматы
3. Добавить функционал рисования диаграмм
4. Создать фронтенд на ReactJS
5. Добавить аутентификацию и авторизацию
6. Реализовать версионирование архитектуры 
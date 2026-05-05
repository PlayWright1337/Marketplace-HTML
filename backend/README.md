# Backend

Структура:

```text
backend/
  cmd/api/                 # точка входа HTTP API
  internal/config/          # переменные окружения и конфиг
  internal/httpapi/         # HTTP handlers, routing, responses
  internal/models/          # модели MongoDB/API
  internal/store/           # работа с MongoDB и бизнес-операции
```

Запуск:

```powershell
cd backend
go run ./cmd/api
```

По умолчанию API слушает `http://localhost:8080`, MongoDB ожидается на `mongodb://localhost:27017`, frontend раздается из `../frontend`.

API:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/products`
- `GET /api/categories`
- `GET /api/cart`
- `POST /api/cart`
- `DELETE /api/cart/{id}`
- `GET /api/purchases`
- `POST /api/checkout`
- `GET /api/account`
- `POST /api/top-up`
- `GET /api/support/messages`
- `POST /api/support/messages`
- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/{id}/messages`
- `POST /api/conversations/{id}/messages`

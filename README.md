# Marketplace

Рабочий прототип маркетплейса с отдельными `frontend/` и `backend/`.

```text
frontend/                 # HTML/CSS/JS приложение
backend/
  cmd/api/                # запуск сервера
  internal/config/         # конфиг
  internal/httpapi/        # маршруты и handlers
  internal/models/         # модели
  internal/store/          # MongoDB и бизнес-логика
```

## Запуск

```powershell
docker compose up -d
cd backend
go run ./cmd/api
```

Открыть сайт: `http://localhost:8080`.

## Что работает

- регистрация и вход;
- каталог товаров из MongoDB;
- backend-категории;
- поиск, фильтры и вид списка;
- корзина пользователя;
- пополнение баланса;
- оформление заказа со списанием баланса;
- история покупок;
- общение покупателя с продавцом по товару;
- чат поддержки с сохранением сообщений.

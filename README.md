# Currency Backend (NestJS + Node.js) — конвертація та облік валютних операцій

## Функціонал
- JWT авторизація (register/login), bcrypt-хешування пароля
- Користувацькі рахунки (за замовчуванням UAH), баланс у копійках (integer)
- Курси валют (Monobank API) збережені у PostgreSQL
- Оновлення курсів при старті та щогодини (Nest Schedule)
- Обмін валют (buy/sell) з історією транзакцій
- Swagger документація

## Швидкий старт (Docker)
1) Скопіюй `.env.example` в `.env` і за потреби зміни значення
2) Запуск:
```bash
docker compose up --build
```
3) Swagger:
- http://localhost:3000/api

## Примітки
- Для простоти увімкнено `synchronize: true` (див. `src/db/typeorm.config.ts`). Для production краще перейти на міграції.
- Баланси зберігаються як `BIGINT` у **копійках** (UAH) та в **мінімальних одиницях** валюти рахунку (наприклад, cents).

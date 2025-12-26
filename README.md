# Currency Exchange Backend (NestJS)

## Тема проєкту
**Розробка backend-сервісу для обміну валют із використанням реальних курсів, JWT-авторизації та бази даних PostgreSQL**

---

## Опис проєкту
Даний проєкт являє собою backend-частину вебсервісу для обміну валют.  
Система дозволяє користувачам реєструватися та проходити авторизацію, додавати кредитні картки, поповнювати баланс у гривнях (UAH), купувати та продавати іноземні валюти за актуальними курсами, а також переглядати історію всіх фінансових операцій.

Курси валют отримуються із зовнішнього API Monobank, автоматично оновлюються при старті застосунку та щогодини за допомогою cron-задачі.  
Для забезпечення безпеки використовується JWT-аутентифікація (access та refresh токени), які зберігаються у HttpOnly cookies.

Проєкт повністю контейнеризований за допомогою Docker та може бути розгорнутий у будь-якому середовищі без додаткових налаштувань.

---

## Технологічний стек

### Backend
- Node.js
- NestJS
- TypeScript

### База даних
- PostgreSQL
- TypeORM

### Авторизація та безпека
- JWT (Access token та Refresh token)
- HttpOnly cookies
- bcrypt (хешування паролів)
- AES-256-GCM (шифрування номерів банківських карт)

### Додаткові технології
- Swagger (OpenAPI)
- Postman (тестування API)
- Docker, Docker Compose
- Cron jobs (оновлення курсів валют)

---

## Основний функціонал

### Авторизація та користувачі
- Реєстрація користувачів
- Вхід у систему
- JWT-авторизація
- Access token з терміном життя близько 20 хвилин
- Refresh token з більшим терміном життя
- Email користувача є унікальним у системі

### Профіль користувача
- Перегляд email користувача
- Перегляд балансу в гривнях (UAH)
- Перегляд доданих кредитних карт
- Перегляд валютних активів (USD, EUR тощо)

### Кредитні картки
- Додавання кредитної картки з валідацією:
  - номер карти (рівно 16 цифр)
  - CVV (рівно 3 цифри, не зберігається в базі даних)
  - термін дії у форматі MM/YY
- Збереження номера карти у зашифрованому вигляді
- Відображення користувачу лише останніх 4 цифр номера карти

### Поповнення балансу
- Поповнення балансу з вибраної кредитної картки
- Вибір валюти поповнення
- Автоматична конвертація суми у гривні (UAH)
- Збереження операції як транзакції типу `DEPOSIT`

### Курси валют
- Отримання курсів валют із API Monobank
- Збереження курсів у базі даних у нормалізованому вигляді
- Базова валюта для всіх курсів — USD
- Оновлення курсів:
  - при старті застосунку
  - щогодини за допомогою cron-задачі

### Обмін валют
- Купівля іноземної валюти (BUY)
- Продаж іноземної валюти (SELL)
- Перевірка достатності балансу перед виконанням операції
- Ведення валютних активів користувача
- Пошук валют за кодом (USD, EUR тощо)

### Транзакції
- Збереження всіх фінансових операцій користувача:
  - поповнення балансу (DEPOSIT)
  - обмін валют (EXCHANGE: BUY / SELL)
- Перегляд повної історії транзакцій

---

## ERD (Entity Relationship Diagram)

```dbml
Table users {
  id uuid [pk]
  email varchar [unique]
  password_hash varchar
  refresh_token_hash varchar
  balance_uah numeric
  created_at timestamp
}

Table cards {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  encrypted_number varchar
  last4 varchar
  exp_month int
  exp_year int
  created_at timestamp
}

Table assets {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  code varchar
  amount numeric
}

Table rates {
  id uuid [pk]
  base varchar
  code varchar
  value numeric
  updated_at timestamp
}

Table transactions {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  type varchar
  deposit_currency varchar
  deposit_amount numeric
  deposit_rate_uah_per_usd numeric
  deposit_credited_uah numeric
  exchange_side varchar
  exchange_currency varchar
  exchange_currency_amount numeric
  exchange_uah_amount numeric
  exchange_rate numeric
  created_at timestamp
}

# 🧩 JobTracker

**JobTracker** е модерен full-stack проект за управление на кандидатури за работа.  
Системата използва **.NET 8 microservices**, **Ocelot API Gateway**, **React + Redux frontend**,  
и технологии като **JWT Authentication**, **Redis caching**, **RabbitMQ event bus**, **PostgreSQL**, и **Serilog**.

---

## 🏗️ Архитектура

```
Frontend (React + Redux)
        ↓
   Gateway (Ocelot)
   ├── /identity/* → IdentityService
   ├── /application/* → ApplicationsService
   └── /notifications/* → NotificationService
```

---

## 📁 Project Structure

```
JobTracker/
├── Gateway/                              # Ocelot API Gateway
│   ├── ocelot.json
│   ├── Program.cs
│   └── appsettings.json
│
├── IdentityService/                      # Authentication & User Management
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   │   ├── JwtTokenService.cs
│   │   ├── RedisCacheService.cs
│   │   └── EmailService.cs
│   ├── Migrations/
│   ├── Program.cs
│   └── appsettings.json
│
├── ApplicationsService/                  # Job Applications CRUD + HR roles
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   │   └── ApplicationService.cs
│   ├── Migrations/
│   ├── Program.cs
│   └── appsettings.json
│
├── NotificationService/                  # Event consumer (RabbitMQ) + Email/Push notifications
│   ├── Consumers/
│   │   ├── UserCreatedConsumer.cs
│   │   ├── ApplicationCreatedConsumer.cs
│   │   └── StatusChangedConsumer.cs
│   ├── Services/
│   │   ├── EmailNotificationService.cs
│   │   └── PushNotificationService.cs
│   ├── Program.cs
│   └── appsettings.json
│
├── Shared/                               # Shared library with contracts, events & DTOs
│   ├── Events/
│   │   ├── UserCreatedEvent.cs
│   │   ├── ApplicationCreatedEvent.cs
│   │   └── StatusChangedEvent.cs
│   ├── DTOs/
│   ├── Extensions/
│   └── Shared.csproj
│
├── client-app/                           # React + Redux frontend (Vite)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── applications/
│   │   │   ├── notifications/
│   │   │   └── shared/
│   │   ├── store/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── docker-compose.yml                    # Docker orchestration (Postgres, Redis, RabbitMQ, all services)
├── JobTracker.sln                        # Solution file for all backend services
└── README.md
```

---

## 🔐 Authentication Flow

1. Потребител влиза чрез `IdentityService /api/auth/login`.
2. Успешен логин връща JWT токен + refresh token.
3. Frontend съхранява токена в `localStorage`.
4. Всички заявки към API се пращат с:
   ```
   Authorization: Bearer <token>
   ```
5. Backend валидира токена и ролята (`User`, `HR`).
6. Ролята определя достъпа.

---

## 🧠 Основни технологии

### Backend
- .NET 8 WebAPI (C#)
- Entity Framework Core + PostgreSQL
- JWT Authentication + Role-based Authorization
- MassTransit + RabbitMQ
- Redis (StackExchange.Redis)
- Serilog logging
- Swagger / OpenAPI

### Frontend
- React 18 + Vite
- Redux Toolkit
- React Router v6
- Bootstrap 5
- TypeScript

---

## 🚀 Стартиране

### 1️⃣ Инфраструктура (Docker)
```bash
docker-compose up -d
```

Стартира:
- PostgreSQL
- Redis
- RabbitMQ (http://localhost:15672, guest / guest)

### 2️⃣ Бекенд
```bash
cd IdentityService && dotnet run
cd ../ApplicationsService && dotnet run
cd ../NotificationService && dotnet run
cd ../Gateway && dotnet run
```

### 3️⃣ Фронтенд
```bash
cd client-app
npm install
npm run dev
```

Отвори 👉 `http://localhost:5037`

---

## 🧩 Notifications

- Слуша събития от RabbitMQ (user/application changes)
- Изпраща Email или Push известия
- Работи със `Shared` DLL (events и DTOs)

---

## 🧾 Swagger

| Service | URL |
|----------|-----|
| IdentityService | https://localhost:7055/swagger |
| ApplicationsService | https://localhost:7118/swagger |
| Gateway | https://localhost:7251/swagger |

---

## 🧰 Logging

- Serilog → конзола и файлове (`logs/`)
- `GET /health` → здравен чек за всеки service

---

## 👨‍💻 Автор

**spaghettisource**  
Full-stack developer 🍝  
[https://github.com/spaghettisource](https://github.com/spaghettisource)

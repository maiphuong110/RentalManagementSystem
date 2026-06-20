# 🏠 RENT+ — A Comprehensive Web-Based Accommodation Management System

> **CS3332 – Software Engineering** | Hanoi University of Science and Technology

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.x-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📋 Overview

**RENT+** is a full-stack web application designed to digitize and streamline the entire room rental management process in Vietnam. The system eliminates paper-based management by providing a unified platform for two distinct user roles:

| Role | Description | Key Capabilities |
|------|-------------|-----------------|
| **OWNER** | Landlord / Property Manager | Manage properties & rooms, generate monthly bills, track payments, post rental listings, view analytics dashboard |
| **TENANT** | Renter | View room details, browse listings, track bills, manage contracts, AI-powered chat support |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 21 | Core language |
| Spring Boot | 3.5.x | Application framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA + Hibernate | — | ORM & Database access |
| jjwt | 0.12.5 | JWT token generation & validation |
| Lombok | 1.18.32 | Boilerplate code reduction |
| MySQL Connector/J | — | MySQL JDBC driver |
| Spring Modulith | 1.4.x | Modular architecture support |
| Maven | 3.8+ | Build tool |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI framework (SPA) |
| Vite | 7.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client for REST API |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Chart.js + react-chartjs-2 | 4.x / 5.x | Data visualization charts |
| Lucide React | 1.x | Icon library |

---

## 🗂️ Project Structure

```
Project_CS332/
│
├── backend/                          ← Spring Boot (Java 21)
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/trosmart/backend/
│       │   │   ├── BackendApplication.java        ← Entry point
│       │   │   ├── config/                        ← SecurityConfig, CORS
│       │   │   ├── controller/                    ← REST API endpoints
│       │   │   │   ├── AuthController.java        ← /api/v1/auth/**
│       │   │   │   ├── PropertyController.java    ← /api/v1/properties/**
│       │   │   │   ├── RoomController.java        ← /api/v1/rooms/**
│       │   │   │   ├── BillController.java        ← /api/v1/bills/**
│       │   │   │   ├── ContractController.java    ← /api/v1/contracts/**
│       │   │   │   ├── PostController.java        ← /api/v1/posts/**
│       │   │   │   ├── AmenityController.java     ← /api/v1/amenities/**
│       │   │   │   ├── ConversationController.java← /api/v1/conversations/**
│       │   │   │   ├── NotificationController.java
│       │   │   │   └── UserController.java
│       │   │   ├── service/                       ← Business logic layer
│       │   │   ├── repository/                    ← JPA Repositories
│       │   │   ├── entity/                        ← JPA Entity classes
│       │   │   │   ├── User.java
│       │   │   │   ├── Property.java
│       │   │   │   ├── Room.java / RoomStatus.java
│       │   │   │   ├── MonthlyBill.java
│       │   │   │   ├── Contract.java
│       │   │   │   ├── Post.java / PostImage.java / PostRule.java
│       │   │   │   ├── Amenity.java / RoomAmenity.java
│       │   │   │   ├── Record.java
│       │   │   │   ├── Conversation.java / Message.java
│       │   │   │   ├── Notification.java
│       │   │   │   ├── RefreshToken.java
│       │   │   │   ├── Role.java / ElecKind.java / PropertyType.java
│       │   │   ├── dto/                           ← Request & Response DTOs
│       │   │   ├── security/                      ← JwtAuthFilter, JwtUtil, EntryPoint
│       │   │   ├── exception/                     ← Global exception handling
│       │   │   └── util/                          ← Utility helpers
│       │   └── resources/
│       │       ├── application.yml                ← Main configuration
│       │       └── application-prod.yml           ← Production config (Railway)
│       └── test/                                  ← Unit & Integration tests
│
├── frontend/                         ← React 19 + Vite + Tailwind CSS
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env                          ← VITE_API_URL (local)
│   ├── .env.example                  ← Template for environment variables
│   └── src/
│       ├── main.jsx                  ← Entry point
│       ├── App.jsx                   ← Router setup & protected routes
│       ├── api/                      ← Axios API call modules
│       │   ├── axiosInstance.js      ← Base config + JWT interceptor
│       │   ├── authApi.js
│       │   ├── propertyApi.js
│       │   ├── roomApi.js
│       │   ├── billApi.js
│       │   ├── contractApi.js
│       │   ├── postApi.js
│       │   ├── amenityApi.js
│       │   ├── chatApi.js
│       │   ├── notificationApi.js
│       │   └── userApi.js
│       ├── context/                  ← React Context (Auth state)
│       ├── components/               ← Reusable UI components
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── ChatPage.jsx          ← AI-powered chat interface
│       │   ├── owner/                ← OWNER-only pages
│       │   │   ├── DashboardPage.jsx
│       │   │   ├── PropertiesPage.jsx
│       │   │   ├── RoomsPage.jsx
│       │   │   ├── RoomDetailPage.jsx
│       │   │   ├── BillsPage.jsx
│       │   │   ├── ContractsPage.jsx
│       │   │   └── PostsPage.jsx
│       │   └── tenant/               ← TENANT-only pages
│       │       ├── TenantHomePage.jsx
│       │       ├── MyRoomPage.jsx
│       │       ├── MyBillsPage.jsx
│       │       ├── ContractsPage.jsx
│       │       └── PostDetailPage.jsx
│       └── utils/                    ← Helper functions
│
└── postman/                          ← Postman API collection for testing
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites

Make sure the following tools are installed:

| Tool | Version | Download |
|------|---------|---------|
| Java JDK | 21+ | [adoptium.net](https://adoptium.net) |
| Maven | 3.8+ | Bundled with IntelliJ IDEA |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| MySQL | 8.0 | Via XAMPP: [apachefriends.org](https://apachefriends.org) |

---

### Step 1 — Set Up Database

1. Start **MySQL** (via XAMPP or MySQL server directly)
2. Create a database named `trosmart` (or whatever is configured in `application.yml`)
3. Run the schema migration — Spring Boot with `ddl-auto: update` will auto-create tables on first run

---

### Step 2 — Configure & Run Backend

1. Open the `backend/` folder in **IntelliJ IDEA**

2. Create the file `backend/src/main/resources/application.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/trosmart?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh
    username: root
    password:           # leave blank if XAMPP has no password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

jwt:
  secret: your-secret-key-minimum-256-bits-long-here
  expiration: 86400000        # 24 hours in milliseconds
  refresh-expiration: 604800000  # 7 days in milliseconds
```

3. Run `BackendApplication.java` (click ▶ in IntelliJ)

4. **Verify:** `GET http://localhost:8080/api/v1/amenities` → returns `200 OK` ✅

---

### Step 3 — Configure & Run Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Then edit .env and set:
# VITE_API_URL=http://localhost:8080

# Start development server
npm run dev
```

Open your browser at **http://localhost:5173** ✅

---

## 🔌 API Endpoints Overview

### Authentication — `/api/v1/auth`
```
POST   /api/v1/auth/register     ← Register new account (OWNER)
POST   /api/v1/auth/login        ← Login, receive JWT + Refresh Token
POST   /api/v1/auth/refresh      ← Refresh access token
```

### Properties — `/api/v1/properties`
```
GET    /api/v1/properties        ← List all properties (OWNER)
POST   /api/v1/properties        ← Create new property
PUT    /api/v1/properties/{id}   ← Update property details
DELETE /api/v1/properties/{id}   ← Delete property
```

### Rooms — `/api/v1/rooms`
```
GET    /api/v1/rooms             ← List rooms (filtered by property)
POST   /api/v1/rooms             ← Create new room (OWNER)
PUT    /api/v1/rooms/{id}        ← Update room info (OWNER)
DELETE /api/v1/rooms/{id}        ← Delete room (OWNER)
```

### Bills — `/api/v1/bills`
```
GET    /api/v1/bills             ← Get all bills (OWNER)
POST   /api/v1/bills             ← Generate monthly bill with meter readings
PUT    /api/v1/bills/{id}        ← Update / mark payment
GET    /api/v1/bills/tenant      ← Get my bills (TENANT)
```

### Contracts — `/api/v1/contracts`
```
GET    /api/v1/contracts         ← List contracts (OWNER)
POST   /api/v1/contracts         ← Create new contract (sign tenant in)
GET    /api/v1/contracts/tenant  ← My contract info (TENANT)
```

### Posts (Rental Listings) — `/api/v1/posts`
```
GET    /api/v1/posts             ← Public listing of rooms for rent
POST   /api/v1/posts             ← Create rental listing (OWNER)
GET    /api/v1/posts/{id}        ← View listing detail
```

### Amenities — `/api/v1/amenities`
```
GET    /api/v1/amenities         ← List all available amenities
```

### Conversations (AI Chat) — `/api/v1/conversations`
```
GET    /api/v1/conversations     ← Get chat history
POST   /api/v1/conversations     ← Send message, receive AI reply
```

### Users — `/api/v1/users`
```
GET    /api/v1/users/me          ← Get current user profile
PUT    /api/v1/users/me          ← Update profile
PUT    /api/v1/users/me/password ← Change password
```

### Notifications — `/api/v1/notifications`
```
GET    /api/v1/notifications     ← Get notifications for current user
PUT    /api/v1/notifications/{id}/read ← Mark as read
```

---

## 🌐 Deployment

### Backend → Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```
Set the following environment variables in Railway dashboard:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`

### Frontend → Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
cd frontend
vercel --prod
```
Set environment variable in Vercel dashboard:
- `VITE_API_URL` = `https://your-railway-backend-url`

---

## 🧪 Running Tests

```bash
# Backend unit tests
cd backend
.\mvnw.cmd test

# View test reports
start target/surefire-reports/index.html
```

> **Note:** Ensure MySQL is running and `application.yml` is properly configured before running tests. Tests require a live database connection.

---

## 🌿 Git Workflow

```bash
# Clone the repository
git clone https://github.com/[your-team]/Project_CS332.git

# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Commit following conventional format
git commit -m "feat: add bill auto-calculation logic"
git commit -m "fix: resolve JWT token expiry issue"
git commit -m "docs: update API endpoint documentation"
git commit -m "test: add unit tests for BillService"

# Push and create Pull Request to develop
git push origin feature/your-feature-name
```

**Branch Strategy:**
```
main        ← Production (merge only after full testing)
develop     ← Integration branch (all features merge here)
feature/*   ← Individual feature branches
fix/*       ← Bug fix branches
```

---

## 👥 Team Contributions

| Member | Role | Responsibilities |
|--------|------|-----------------|
| M1 | Backend Lead | Security config, Entity models, JPA repositories, Database schema |
| M2 | Backend Dev | Auth module, Room & Property controllers/services, DTOs |
| M3 | Backend Dev | Bill, Contract, Post controllers/services, DTOs |
| M4 | Frontend Dev | Auth context, Login page, Owner pages (Rooms, Bills, Contracts) |
| M5 | Frontend Lead | Dashboard, Tenant pages, API layer, Chat integration, README |

---

## 📬 Postman Collection

A Postman collection is available in the `/postman` directory. Import it into Postman to quickly test all API endpoints with pre-configured requests and environment variables.

---

*RENT+ — CS3332 Software Engineering Project — Hanoi University of Science and Technology*

# QuickFund - Micro-Lending Platform

> **A Scalable Micro-Lending Platform with Smart Scoring & Payment Integration**

[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-green.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10-blue.svg)](https://www.docker.com/)

---

## 📷 Architecture Diagram

> _QuickFund Your Trusted Lender Just a Click_

![Architecture Diagram](docs/image-1.png)

---

## 🚀 Project Overview

QuickFund is a production-ready micro-lending platform enabling users to apply for small personal loans with instant scoring and approval decisions. The platform features a comprehensive admin dashboard, secure payment processing, and a modern user interface.

---

## ✨ Key Features

- **🔐 Secure Authentication** — JWT-based authentication with role-based access control
- **💰 Loan Management** — Apply, track, and manage loan applications
- **📊 Smart Scoring** — Rule-based credit scoring system (mocked)
- **💳 Payment Processing** — Virtual account and card payment simulation (mocked)
- **📱 Real-time Notifications** — Email and SMS notification system (mocked)
- **📈 Admin Dashboard** — Comprehensive loan management and analytics
- **📄 Document Management** — Secure document upload and verification (mocked)
- **🔒 Security First** — OWASP compliance, input validation, rate limiting

---

## 🏗️ File Structure

```
QuickFund/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   └── main.ts         # Application entry point
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── frontend/               # Next.js React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Next.js pages
│   │   └── styles/         # TailwindCSS styles
│   └── package.json
├── docker-compose.yml      # Multi-container setup
├── docs/                   # Documentation assets (e.g., architecture.png)
└── README.md
```

---

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with Passport.js
- **Queue System:** Bull with Redis (planned)
- **Documentation:** Swagger/OpenAPI
- **Validation:** class-validator, class-transformer

### Frontend
- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** React Hooks
- **HTTP Client:** Axios
- **UI Components:** Custom components with TailwindCSS

### DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Database:** PostgreSQL
- **Caching:** Redis (planned)
- **Security:** Helmet, CORS, Rate Limiting
- **Cloud Deployment:** Azure Container Apps (planned, not yet live)

---

## 🚀 Quick Start / Installation

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Option 1: Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/Chymezy/QuickFund-.git
cd QuickFund-

# Copy and edit environment variables for backend and frontend
cp backend/.env.example backend/.env
cp quickFund/.env.local.example quickFund/.env.local
# Edit backend/.env and quickFund/.env.local as needed

# Start all services (backend, frontend, Postgres, Redis)
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/Chymezy/QuickFund-.git
cd QuickFund-

# Install dependencies for both backend and frontend
npm run install:all

# Copy and edit environment variables
cp backend/.env.example backend/.env
cp quickFund/.env.local.example quickFund/.env.local
# Edit backend/.env and quickFund/.env.local as needed

# Start Postgres and Redis (can use Docker Compose or local installations)
docker-compose up db redis
# Or start your own Postgres/Redis locally

# Run database migrations and seeders
cd backend
npx prisma migrate deploy
npx ts-node scripts/create-admin.ts

# Start backend
yarn start:dev
# or
npm run start:dev

# In another terminal, start frontend
cd ../quickFund
npm run dev
```

---

## 🚦 Project Status

### ✅ Fully Implemented
- User authentication and authorization
- Loan application and management
- Admin dashboard with approval/rejection
- Database schema and migrations
- API documentation with Swagger
- Docker containerization (local)
- Security features (JWT, validation, rate limiting)
- Frontend UI with TailwindCSS

### 🔄 Mocked/Simplified
- Payment gateway integration (simulated responses)
- Email/SMS notifications (logged)
- Credit scoring (rule-based, mocked)
- File upload (local storage, mocked)
- Advanced admin analytics (basic stats only)
- Queue-based background jobs (Bull/Redis)

### 🚧 Planned / Not Yet Implemented
- Real payment gateway integration
- Real-time notifications (WebSocket)
- Advanced credit scoring algorithms
- Cloud deployment to Azure Container Apps
- Advanced reporting and analytics
- Mobile application
- Multi-language support


---

## 🔄 CI/CD Pipeline

- **Local Dockerization:**
  - The project is fully dockerized for local development and testing using `docker-compose`.
- **CI/CD:**
  - GitHub Actions pipeline for linting, testing, building Docker images, and (optionally) deployment.
  - See `.github/workflows/` for pipeline configuration.
- **Cloud Deployment:**
  - Intended deployment target: **Azure Container Apps** (not yet live in this version).
  - All configuration and Dockerfiles are ready for cloud deployment.

---

## 📋 API Documentation

- **Swagger/OpenAPI** is available at `/api/docs` when the backend is running.
- See the [API Endpoints](#api-documentation) section below for key routes.

---

## 📝 Trade-offs & Architecture Decisions

- **Monorepo Structure:**
  - Chosen for easier management of frontend and backend in a single repository, simplifying CI/CD and onboarding.
- **Mocked Integrations:**
  - Payment, notifications, and scoring are mocked to focus on core lending logic and rapid prototyping. Real integrations are planned for future versions.
- **Prisma ORM:**
  - Used for type-safe, rapid database development and migration management.
- **Dockerization:**
  - Ensures consistent local development and easy transition to cloud deployment.
- **Azure Container Apps:**
  - Selected for scalable, managed deployment, but not yet live due to project timeline.
- **Security:**
  - Prioritized with JWT, input validation, rate limiting, and CORS/Helmet, but some advanced protections (e.g., full audit logging) are planned.
- **Testing:**
  - Basic test scaffolding is present; full coverage is a future goal.

---

## 👥 Test Credentials

### User Account
```
Email: user@quickfund.com
Password: password123
```

### Admin Account
```
Email: admin@quickfund.com
Password: admin123
```

---

## 📈 Performance & Scalability

- **Database Indexing:** Optimized queries with Prisma
- **Caching:** Redis planned for session/data caching
- **Queue Processing:** Bull queues for background jobs (planned)
- **Connection Pooling:** Database connection optimization
- **Compression:** Response compression with middleware

---

## 📝 Development Guidelines

- TypeScript strict mode enabled
- ESLint and Prettier configuration
- Consistent naming conventions
- Comprehensive error handling
- Feature branch workflow
- Conventional commit messages
- Pull request reviews
- Automated testing on push

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---
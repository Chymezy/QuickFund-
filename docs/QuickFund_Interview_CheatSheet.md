# QuickFund Interview Cheatsheet

## I. Backend (NestJS, Prisma, PostgreSQL)

### 1. Architecture & Stack
- **Soundbite:**
  > "I chose a modular, service-oriented architecture..."
- **Show:**
  - `backend/` folder structure
  - `main.ts` (NestJS entry point)
  - `app.module.ts` (module organization)
  - `docker-compose.yml` (backend service definition)

---

### 2. Authentication & Security
- **Soundbite:**
  > "Authentication uses a hybrid approach: JWTs for stateless API access..."
- **Show:**
  - `auth/` module: `auth.controller.ts`, `auth.service.ts`
  - `jwt.strategy.ts`, `session.strategy.ts`
  - Guards: `jwt-auth.guard.ts`, `roles.guard.ts`
  - Password hashing/validation logic
  - RBAC implementation (roles, permissions)

---

### 3. Loan Application & Scoring
- **Soundbite:**
  > "Users can apply for loans through a simple, guided form..."
- **Show:**
  - `loan/` module: `loan.controller.ts`, `loan.service.ts`
  - Scoring logic (modular/configurable)
  - Prisma models for loans/applications

---

### 4. Admin Functionality
- **Soundbite:**
  > "Admins have a dedicated dashboard to review, approve, or reject loan applications..."
- **Show:**
  - Admin endpoints in `loan.controller.ts` (approve/reject)
  - RBAC checks in controllers/guards
  - Logging/auditing (if present)

---

### 5. Database & Migrations
- **Soundbite:**
  > "Prisma handles schema migrations and type-safe queries..."
- **Show:**
  - `prisma/schema.prisma`
  - `prisma/migrations/`
  - `prisma/seed.ts`
  - Docker volume config in `docker-compose.yml`

---

### 6. Error Handling & Testing
- **Soundbite:**
  > "I implemented global error handling in the backend..."
- **Show:**
  - Global exception filter (`common/filters/http-exception.filter.ts` or similar)
  - Example test files (`auth.service.spec.ts`, `loan.service.spec.ts`)
  - CI pipeline test step in GitHub Actions

---

### 7. DevOps & CI/CD
- **Soundbite:**
  > "I set up Docker for local development and production parity..."
- **Show:**
  - `Dockerfile` for backend
  - `docker-compose.yml` (backend service, DB, volumes)
  - `.github/workflows/ci.yml` (CI/CD pipeline for backend)
  - Where migrations/seeds run in pipeline

---

## II. Frontend (Next.js, React, Zustand, TailwindCSS)

### 1. Architecture & Stack
- **Soundbite:**
  > "The frontend is a Next.js SPA, using Zustand for state management..."
- **Show:**
  - `frontend/` folder structure
  - Entry point (`pages/_app.tsx` or `src/main.tsx`)
  - State management setup (Zustand store)

---

### 2. Authentication & Security
- **Soundbite:**
  > "Frontend handles auth state with Zustand, using httpOnly cookies for security..."
- **Show:**
  - Auth logic in Zustand store or context
  - API calls for login/logout (e.g., `api/auth.ts`)
  - Handling of httpOnly cookies (fetch/axios config)
  - Role-based UI (conditional rendering for admin/user)

---

### 3. Loan Application Flow
- **Soundbite:**
  > "Users can apply for loans through a simple, guided form..."
- **Show:**
  - Loan application form component (`components/LoanForm.tsx`)
  - API integration for submitting applications
  - State updates and error handling

---

### 4. Admin Dashboard
- **Soundbite:**
  > "Admins have a dedicated dashboard to review, approve, or reject loan applications..."
- **Show:**
  - Admin dashboard component (`components/AdminDashboard.tsx`)
  - Conditional rendering based on user role
  - API calls for approving/rejecting loans

---

### 5. Error Handling & Testing
- **Soundbite:**
  > "The frontend displays user-friendly error messages and handles errors gracefully..."
- **Show:**
  - Error display components or error boundaries
  - Example frontend test files (if present)

---

### 6. DevOps & CI/CD
- **Soundbite:**
  > "Frontend is containerized and built/tested in CI/CD for consistency..."
- **Show:**
  - `Dockerfile` for frontend
  - `docker-compose.yml` (frontend service)
  - `.github/workflows/ci.yml` (frontend build/test steps)

---

## III. Documentation, Trade-offs & Improvements
- **Soundbite:**
  > "Given the time constraints, I prioritized core features and security..."
- **Show:**
  - `README.md` (project summary, setup)
  - Architecture diagrams or docs
  - Areas marked for future improvement (TODOs, comments, docs)

---

## Closing Soundbite
- **Soundbite:**
  > "Overall, QuickFund demonstrates my ability to deliver a secure, maintainable, and production-ready system..."
- **Show:**
  - `README.md` and any summary/closing documentation 
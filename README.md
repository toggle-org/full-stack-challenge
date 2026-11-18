> **Interview app:** see [esim-orders/](esim-orders/README.md). The apps below are not used.

# Full-Stack Interview Challenge: VPN SaaS

This repository contains:

- `backend` — NestJS + TypeScript API using CQRS, TypeORM, PostgreSQL, Stripe, JWT auth
- `frontend` — Vite + React landing page with Stripe Elements checkout and account page

## Implemented Product Flow

1. Frontend loads plans from backend (`name`, `description`, `price`, `stripePriceId`).
2. User selects a plan, enters email, and fills card details.
3. On **Buy**:
   - Frontend calls backend to create Stripe PaymentIntent.
   - Frontend confirms card payment with Stripe Elements.
   - Frontend calls backend to create subscription using `paymentMethodId + email + planId`.
4. Backend subscription creation flow:
   - Finds/creates Stripe customer.
   - Attaches payment method to customer and sets default payment method.
   - Creates Stripe subscription.
   - Creates local user (if missing) with generated password and logs password in backend console.
   - Creates local subscription record.
5. Frontend then renders login screen.
6. After login, account page exposes one button: **Get VPN configuration**.
7. On first request, backend assigns one available VPN config to user and persists it.

## Tech Stack

### Backend

- NestJS 11
- CQRS (`@nestjs/cqrs`)
- TypeORM + PostgreSQL
- Stripe SDK
- JWT auth (email/password)
- Swagger docs (`/api/docs`)

### Frontend

- Vite + React + TypeScript
- Stripe Elements (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- Axios

## Project Structure

- `backend/src/modules/plans` — plans query endpoint
- `backend/src/modules/payments` — create payment intent
- `backend/src/modules/subscriptions` — create subscription orchestration
- `backend/src/modules/auth` — login endpoint + JWT strategy
- `backend/src/modules/vpn-configs` — get/assign user VPN configuration
- `backend/src/seed.ts` — seeds plans and up to 1000 VPN configurations
- `frontend/src/App.tsx` — landing + checkout + login + account screens

## Prerequisites

- Node.js 20+
- npm 10+
- Docker (for local PostgreSQL)
- Stripe test account and API keys

## Environment Variables

1. Copy root environment template:

```bash
cp .env.example .env
```

2. Copy service-level environment templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Fill required Stripe values:

- `STRIPE_SECRET_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_ID_STARTER`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_PRICE_ID_ULTIMATE`

## Local Run

### 1) Start Postgres

```bash
docker compose up -d
```

### 2) Start Backend

```bash
cd backend
npm install
npm run seed
npm run start:dev
```

Backend runs on `http://localhost:3000`
Swagger: `http://localhost:3000/api/docs`

### 3) Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Test & Build

### Backend

```bash
cd backend
npm test
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

## API Summary

- `GET /plans`
- `POST /payments/create-intent`
- `POST /subscriptions/create`
- `POST /auth/login`
- `GET /vpn-configs/me` (JWT)
- `POST /vpn-configs/assign` (JWT)

## Notes for Interviewers

- This implementation intentionally uses `synchronize: true` for speed of setup in interview context.
- Generated user password is logged in backend console after first successful subscription.
- 1000 VPN configurations are pre-generated via seed command.

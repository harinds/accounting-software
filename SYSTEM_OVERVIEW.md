# System Overview - Visual Guide

Complete visual representation of the accounting software architecture.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐              ┌────────────────────┐                │
│  │  Bubble.io Frontend │              │  React Frontend    │                │
│  │  (No-Code Option)   │              │  (TypeScript/Vite) │                │
│  │                     │              │                    │                │
│  │  • Visual Builder   │              │  • React 18        │                │
│  │  • API Connector    │              │  • TailwindCSS     │                │
│  │  • Workflows        │              │  • TanStack Query  │                │
│  │  • Responsive       │              │  • Zustand         │                │
│  └──────────┬──────────┘              └──────────┬─────────┘                │
│             │                                    │                          │
│             └────────────────┬───────────────────┘                          │
│                              │                                              │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                        HTTPS/REST API
                               │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                        BACKEND API LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Express.js API Server                             │  │
│  │                    (Node.js 20 + TypeScript)                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Middleware Layer                             │  │
│  │                                                                      │  │
│  │  [Auth]  [Logging]  [Rate Limit]  [Validation]  [Error Handler]    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────┬──────────────────────────┬─────────────────┐  │
│  │   Authentication API    │   Transaction API        │   Report API    │  │
│  │                         │                          │                 │  │
│  │  POST /auth/register    │  GET    /transactions    │  GET /profit-loss│  │
│  │  POST /auth/login       │  POST   /transactions    │  GET /cashflow   │  │
│  │  POST /auth/refresh     │  PUT    /transactions/:id│  GET /balance-sheet│
│  │  POST /auth/logout      │  DELETE /transactions/:id│  GET /tax-summary│  │
│  └─────────────────────────┴──────────────────────────┴─────────────────┘  │
│                                                                              │
│  ┌─────────────────────────┬──────────────────────────┬─────────────────┐  │
│  │    Payment API          │    Bank Feed API         │    Tax API      │  │
│  │                         │                          │                 │  │
│  │  POST /payments/receive │  POST /bank-feeds/connect│  POST /bas/calc │  │
│  │  POST /payments/payout  │  GET  /bank-feeds/accounts│ POST /bas/lodge│  │
│  │  GET  /payments/balance │  POST /bank-feeds/sync   │  GET  /bas/status│  │
│  └─────────────────────────┴──────────────────────────┴─────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        Service Layer                                 │  │
│  │                                                                      │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │  │
│  │  │  Payment   │ │  BankFeed  │ │    Tax     │ │ Transaction│      │  │
│  │  │  Service   │ │  Service   │ │  Service   │ │  Service   │      │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────────────┐
│                        DATA & STORAGE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Supabase                                     │  │
│  │                  (Managed PostgreSQL + Services)                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────┬────────────────────┬────────────────────────────┐  │
│  │   PostgreSQL DB    │   Authentication   │   Storage                  │  │
│  │                    │                    │                            │  │
│  │  • users           │  • JWT tokens      │  • Document uploads        │  │
│  │  • organizations   │  • OAuth providers │  • Receipt images          │  │
│  │  • transactions    │  • MFA support     │  • Report exports          │  │
│  │  • invoices        │  • Session mgmt    │                            │  │
│  │  • payments        │                    │                            │  │
│  │  • bank_feeds      │                    │                            │  │
│  │  • tax_returns     │                    │                            │  │
│  │  • audit_logs      │                    │                            │  │
│  └────────────────────┴────────────────────┴────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Row Level Security (RLS)                          │  │
│  │                                                                      │  │
│  │  • Users can only see their organization data                       │  │
│  │  • Role-based access control (owner/admin/viewer)                   │  │
│  │  • Automatic data isolation                                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Redis Cache                                  │  │
│  │                                                                      │  │
│  │  • Session storage                                                   │  │
│  │  • Job queues                                                        │  │
│  │  • Rate limiting                                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL INTEGRATIONS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐  │
│  │      Monoova       │   │       Basiq        │   │      LodgeIT       │  │
│  │  Payment Gateway   │   │   CDR Provider     │   │   Tax Lodgement    │  │
│  │                    │   │                    │   │                    │  │
│  │ • Receive payments │   │ • Bank connections │   │ • BAS preparation  │  │
│  │ • Send payments    │   │ • Transaction sync │   │ • BAS lodgement    │  │
│  │ • Account balance  │   │ • Auto-categorize  │   │ • Tax returns      │  │
│  │ • Payment status   │   │ • Multi-bank       │   │ • ATO integration  │  │
│  │                    │   │                    │   │                    │  │
│  │ ↓ Webhooks ↓       │   │ ↓ Webhooks ↓       │   │ ↓ Webhooks ↓       │  │
│  └────────────────────┘   └────────────────────┘   └────────────────────┘  │
│           │                         │                         │             │
│           └─────────────────────────┼─────────────────────────┘             │
│                                     │                                       │
│                        POST /api/webhooks/*                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT & CI/CD                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         GitHub Actions                               │  │
│  │                                                                      │  │
│  │  On Push to main:                                                   │  │
│  │    1. Run tests (backend + frontend)                                │  │
│  │    2. Lint code                                                     │  │
│  │    3. Build Docker images                                           │  │
│  │    4. Deploy backend to Railway                                     │  │
│  │    5. Deploy frontend to Vercel                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────┐  │
│  │      Railway        │   │       Vercel        │   │  Docker Compose │  │
│  │   (Backend Host)    │   │  (Frontend Host)    │   │  (Self-Hosted)  │  │
│  │                     │   │                     │   │                 │  │
│  │ • Auto-deploy       │   │ • Global CDN        │   │ • All services  │  │
│  │ • Auto-scaling      │   │ • Edge functions    │   │ • Local control │  │
│  │ • Custom domains    │   │ • Auto SSL          │   │ • Cost-effective│  │
│  │ • Environment vars  │   │ • Preview deploys   │   │                 │  │
│  └─────────────────────┘   └─────────────────────┘   └─────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
User (Browser)
    │
    ├─ POST /api/auth/register
    │     │
    │     └──> Backend API
    │            │
    │            └──> Supabase Auth
    │                    │
    │                    └──> Creates user in auth.users
    │                            │
    │                            └──> Returns JWT token
    │                                    │
    │                                    ◄──┘
    │
    ├─ POST /api/auth/login
    │     │
    │     └──> Backend API
    │            │
    │            └──> Supabase Auth
    │                    │
    │                    └──> Validates credentials
    │                            │
    │                            └──> Returns access + refresh tokens
    │                                    │
    │                                    ◄──┘
    │
    └─ Subsequent Requests
          │
          └──> Include: Authorization: Bearer <token>
                  │
                  └──> Backend verifies token
                          │
                          └──> Allows/Denies access
```

### 2. Transaction Creation Flow

```
User Interface
    │
    ├─ Fill transaction form
    │     • Date
    │     • Amount
    │     • Category
    │     • Description
    │
    └─ Click "Save"
          │
          └──> POST /api/transactions
                  │
                  └──> Backend API
                          │
                          ├──> Validate request (Zod)
                          │
                          ├──> Check user authentication
                          │
                          ├──> Check organization access
                          │
                          └──> Transaction Service
                                  │
                                  ├──> Insert into database
                                  │       │
                                  │       └──> Supabase PostgreSQL
                                  │              │
                                  │              └──> transactions table
                                  │
                                  ├──> Create audit log
                                  │       │
                                  │       └──> audit_logs table
                                  │
                                  └──> Return created transaction
                                          │
                                          └──> Frontend updates UI
```

### 3. Bank Feed Sync Flow

```
User Action: "Sync Bank Account"
    │
    └──> POST /api/bank-feeds/sync
            │
            └──> Backend API
                    │
                    └──> BankFeed Service
                            │
                            ├──> Get Basiq access token
                            │       │
                            │       └──> POST https://au-api.basiq.io/token
                            │
                            ├──> Fetch user accounts
                            │       │
                            │       └──> GET /users/{id}/accounts
                            │
                            ├──> Fetch transactions (last 30 days)
                            │       │
                            │       └──> GET /users/{id}/transactions
                            │
                            ├──> For each transaction:
                            │       │
                            │       ├──> Categorize using rules/AI
                            │       │
                            │       ├──> Check if already exists
                            │       │
                            │       └──> Insert into transactions table
                            │
                            └──> Update bank_feeds.last_synced_at
                                    │
                                    └──> Return sync summary
                                            │
                                            └──> Frontend shows results
```

### 4. Payment Processing Flow

```
User Action: "Pay Invoice"
    │
    └──> POST /api/payments/payout
            │
            └──> Backend API
                    │
                    └──> Payment Service
                            │
                            ├──> Fetch invoice details
                            │       │
                            │       └──> invoices table
                            │
                            ├──> Validate payment amount
                            │
                            ├──> Call Monoova API
                            │       │
                            │       └──> POST https://api.monoova.com/v1/payments/payout
                            │              │
                            │              └──> Returns transaction ID
                            │
                            ├──> Create payment record
                            │       │
                            │       └──> INSERT into payments table
                            │
                            ├──> Monoova processes payment
                            │       │
                            │       └──> Sends webhook when complete
                            │              │
                            │              └──> POST /api/webhooks/monoova
                            │                     │
                            │                     └──> Update payment.status
                            │                            │
                            │                            └──> Update invoice.status
                            │
                            └──> Return payment details
                                    │
                                    └──> Frontend polls for status updates
```

### 5. Report Generation Flow

```
User: "View P&L Report"
    │
    └──> GET /api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31
            │
            └──> Backend API
                    │
                    └──> Report Service
                            │
                            ├──> Fetch transactions in date range
                            │       │
                            │       └──> SELECT * FROM transactions
                            │            WHERE organization_id = X
                            │            AND transaction_date BETWEEN dates
                            │
                            ├──> Group by category and type
                            │       │
                            │       ├──> Revenue (credit transactions)
                            │       │     • Category 1: $10,000
                            │       │     • Category 2: $5,000
                            │       │
                            │       └──> Expenses (debit transactions)
                            │             • Category 1: $3,000
                            │             • Category 2: $2,000
                            │
                            ├──> Calculate totals
                            │       │
                            │       ├──> Total Revenue: $15,000
                            │       ├──> Total Expenses: $5,000
                            │       └──> Net Profit: $10,000
                            │
                            └──> Return formatted report
                                    │
                                    └──> Frontend renders charts/tables
```

### 6. Tax Lodgement Flow

```
User: "Lodge BAS"
    │
    ├──> Calculate BAS
    │       │
    │       └──> POST /api/tax/bas/calculate
    │              │
    │              └──> Tax Service
    │                      │
    │                      ├──> Fetch transactions for quarter
    │                      │
    │                      ├──> Calculate GST components:
    │                      │     • G1: Total sales
    │                      │     • G11: Total purchases
    │                      │     • GST collected
    │                      │     • GST paid
    │                      │     • Net GST
    │                      │
    │                      └──> Save to tax_returns table
    │
    ├──> Review & Prepare
    │       │
    │       └──> POST /api/tax/bas/{id}/prepare
    │              │
    │              └──> Tax Service
    │                      │
    │                      └──> Validate with LodgeIT
    │                             │
    │                             └──> POST https://api.lodgeit.net.au/bas/validate
    │
    └──> Lodge to ATO
            │
            └──> POST /api/tax/bas/{id}/lodge
                   │
                   └──> Tax Service
                           │
                           └──> Call LodgeIT
                                  │
                                  └──> POST https://api.lodgeit.net.au/bas/lodge
                                         │
                                         └──> LodgeIT submits to ATO
                                                │
                                                ├──> Sends webhook on status change
                                                │
                                                └──> Update tax_returns.status
                                                       │
                                                       └──> Frontend shows confirmation
```

---

## Technology Stack Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND STACK                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  React 18          →  UI Framework                         │
│  TypeScript 5      →  Type Safety                          │
│  Vite              →  Build Tool                           │
│  TailwindCSS       →  Styling                              │
│  React Router v6   →  Navigation                           │
│  TanStack Query    →  Data Fetching & Caching              │
│  Zustand           →  State Management                     │
│  React Hook Form   →  Form Handling                        │
│  Zod               →  Validation                           │
│  Lucide React      →  Icons                                │
│  Sonner            →  Notifications                        │
│  Recharts          →  Data Visualization                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      BACKEND STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Node.js 20        →  Runtime                              │
│  TypeScript 5      →  Type Safety                          │
│  Express.js        →  Web Framework                        │
│  Supabase Client   →  Database Client                      │
│  Axios             →  HTTP Client                          │
│  Zod               →  Validation                           │
│  Winston           →  Logging                              │
│  JWT               →  Authentication                       │
│  Bcrypt            →  Password Hashing                     │
│  Bull              →  Job Queues                           │
│  Redis (ioredis)   →  Caching                              │
│  Helmet            →  Security Headers                     │
│  CORS              →  Cross-Origin                         │
│  Rate Limiter      →  API Protection                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     DATABASE & STORAGE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PostgreSQL 15     →  Primary Database                     │
│  Supabase          →  Database Platform                    │
│  RLS               →  Row Level Security                   │
│  Redis 7           →  Cache & Queues                       │
│  Supabase Storage  →  File Storage                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DEVOPS & TOOLS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Docker            →  Containerization                     │
│  Docker Compose    →  Multi-container                      │
│  GitHub Actions    →  CI/CD                                │
│  ESLint            →  Linting                              │
│  Jest              →  Backend Testing                      │
│  Vitest            →  Frontend Testing                     │
│  Railway           →  Backend Hosting                      │
│  Vercel            →  Frontend Hosting                     │
│  Nginx             →  Reverse Proxy                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Layer 1: Network Security                                    │
│  ├─ HTTPS/TLS encryption                                      │
│  ├─ CORS policies                                             │
│  └─ Security headers (Helmet.js)                              │
│                                                                │
│  Layer 2: Authentication                                       │
│  ├─ JWT tokens (Supabase Auth)                                │
│  ├─ Password hashing (bcrypt)                                 │
│  ├─ Token refresh mechanism                                   │
│  └─ Session management                                        │
│                                                                │
│  Layer 3: Authorization                                        │
│  ├─ Row Level Security (RLS)                                  │
│  ├─ Role-based access control                                 │
│  ├─ Organization-level isolation                              │
│  └─ Resource ownership validation                             │
│                                                                │
│  Layer 4: API Security                                         │
│  ├─ Rate limiting (100 req/15min)                             │
│  ├─ Request validation (Zod)                                  │
│  ├─ Input sanitization                                        │
│  └─ SQL injection protection                                  │
│                                                                │
│  Layer 5: Data Security                                        │
│  ├─ Encrypted sensitive data                                  │
│  ├─ Webhook signature verification                            │
│  ├─ Secure credential storage                                 │
│  └─ Audit logging                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

**This visualization provides a complete overview of the accounting software system architecture, data flows, and technology stack.**

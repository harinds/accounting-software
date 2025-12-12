# API Documentation

Base URL: `http://localhost:3001` (development) or `https://api.yourapp.com` (production)

## Authentication

All API requests (except auth endpoints) require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

Response:
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_at": 1234567890
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Transactions

#### Get All Transactions
```http
GET /api/transactions?organizationId=uuid&startDate=2024-01-01&endDate=2024-12-31&limit=50&offset=0
Authorization: Bearer <access_token>
```

Response:
```json
{
  "transactions": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "account_id": "uuid",
      "transaction_date": "2024-01-15",
      "amount": 1500.00,
      "description": "Office supplies",
      "type": "debit",
      "category": "Office Expenses",
      "status": "cleared"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organizationId": "uuid",
  "accountId": "uuid",
  "transactionDate": "2024-01-15",
  "amount": 1500.00,
  "description": "Office supplies",
  "type": "debit",
  "category": "Office Expenses"
}
```

#### Update Transaction
```http
PUT /api/transactions/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organizationId": "uuid",
  "amount": 1550.00,
  "description": "Office supplies (updated)"
}
```

#### Delete Transaction
```http
DELETE /api/transactions/:id?organizationId=uuid
Authorization: Bearer <access_token>
```

#### Bulk Import Transactions
```http
POST /api/transactions/bulk-import
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organizationId": "uuid",
  "transactions": [
    {
      "transactionDate": "2024-01-15",
      "amount": 1500.00,
      "description": "Office supplies",
      "type": "debit"
    }
  ]
}
```

### Reports

#### Profit & Loss Report
```http
GET /api/reports/profit-loss?organizationId=uuid&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <access_token>
```

Response:
```json
{
  "organizationId": "uuid",
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "revenue": {
    "total": 250000.00,
    "byCategory": {
      "Product Sales": 200000.00,
      "Service Revenue": 50000.00
    }
  },
  "expenses": {
    "total": 180000.00,
    "byCategory": {
      "Salaries": 120000.00,
      "Rent": 36000.00,
      "Utilities": 24000.00
    }
  },
  "netProfit": 70000.00,
  "profitMargin": 28.0
}
```

#### Cashflow Report
```http
GET /api/reports/cashflow?organizationId=uuid&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <access_token>
```

#### Balance Sheet
```http
GET /api/reports/balance-sheet?organizationId=uuid&date=2024-12-31
Authorization: Bearer <access_token>
```

#### Tax Summary
```http
GET /api/reports/tax-summary?organizationId=uuid&period=Q1-2024
Authorization: Bearer <access_token>
```

### Payments (Monoova)

#### Receive Payment
```http
POST /api/payments/receive
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organizationId": "uuid",
  "amount": 5000.00,
  "currency": "AUD",
  "reference": "INV-001",
  "description": "Payment for invoice INV-001"
}
```

#### Pay Invoice
```http
POST /api/payments/payout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organizationId": "uuid",
  "invoiceId": "uuid",
  "amount": 3000.00,
  "recipientBsb": "123456",
  "recipientAccount": "12345678",
  "recipientName": "Supplier Name",
  "reference": "Payment for supplies"
}
```

#### Get Payment Status
```http
GET /api/payments/:id/status
Authorization: Bearer <access_token>
```

#### Get Account Balance
```http
GET /api/payments/balance?organizationId=uuid
Authorization: Bearer <access_token>
```

### Bank Feeds (Basiq)

#### Connect Bank Account
```http
POST /api/bank-feeds/connect
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organizationId": "uuid"
}
```

Response:
```json
{
  "consentUrl": "https://consent.basiq.io/...",
  "consentId": "uuid"
}
```

#### Get Connected Accounts
```http
GET /api/bank-feeds/accounts?organizationId=uuid
Authorization: Bearer <access_token>
```

#### Sync Transactions
```http
POST /api/bank-feeds/sync
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organizationId": "uuid",
  "accountId": "uuid" // optional
}
```

#### Disconnect Bank Account
```http
DELETE /api/bank-feeds/:id
Authorization: Bearer <access_token>
```

### Tax (LodgeIT)

#### Calculate BAS
```http
POST /api/tax/bas/calculate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organizationId": "uuid",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-03-31"
}
```

Response:
```json
{
  "basId": "uuid",
  "abn": "12345678901",
  "period": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  },
  "calculations": {
    "totalSales": 100000.00,
    "totalPurchases": 60000.00,
    "gstCollected": 10000.00,
    "gstPaid": 6000.00,
    "netGst": 4000.00
  }
}
```

#### Prepare BAS for Lodgement
```http
POST /api/tax/bas/:id/prepare
Authorization: Bearer <access_token>
```

#### Lodge BAS
```http
POST /api/tax/bas/:id/lodge
Authorization: Bearer <access_token>
```

#### Get BAS Status
```http
GET /api/tax/bas/:id/status
Authorization: Bearer <access_token>
```

#### Prepare Tax Return
```http
POST /api/tax/returns/prepare
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organizationId": "uuid",
  "financialYear": "2023-2024"
}
```

#### Lodge Tax Return
```http
POST /api/tax/returns/:id/lodge
Authorization: Bearer <access_token>
```

## Webhooks

### Monoova Webhook
```http
POST /api/webhooks/monoova
X-Monoova-Signature: <signature>

{
  "event": "payment.completed",
  "data": {
    "transactionId": "uuid",
    "status": "completed"
  }
}
```

### Basiq Webhook
```http
POST /api/webhooks/basiq

{
  "event": "transactions.added",
  "data": {
    "accountId": "uuid",
    "count": 5
  }
}
```

### LodgeIT Webhook
```http
POST /api/webhooks/lodgeit

{
  "event": "lodgement.accepted",
  "data": {
    "id": "uuid",
    "status": "accepted"
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

### Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

- Standard endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Pagination

List endpoints support pagination:

```http
GET /api/transactions?limit=50&offset=100
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "total": 500,
  "limit": 50,
  "offset": 100
}
```

## Filtering & Sorting

Most list endpoints support filtering and sorting:

```http
GET /api/transactions?category=Office+Expenses&status=cleared&sort=-transaction_date
```

Supported operators:
- `=`: Equals
- `-<field>`: Sort descending
- `+<field>`: Sort ascending

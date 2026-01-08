# Accounting Software

A comprehensive cloud-based accounting solution with integrated payment processing, bank feeds, and tax lodgement capabilities.

## Features

- Multi-user organization management
- Transaction and invoice management
- Real-time bank feed integration (Basiq CDR)
- Payment processing (Monoova)
- Tax lodgement (BAS, tax returns via LodgeIT)
- Financial reporting (P&L, Cashflow, Balance Sheet)
- Audit logging and compliance

## Tech Stack

### Frontend
- **Primary**: Bubble.io (no-code platform)
- **Alternative**: React 18 + TypeScript + Vite
- TailwindCSS + shadcn/ui
- TanStack Query (React Query)
- Zustand for state management

### Backend
- Node.js 20+ with TypeScript
- Express.js framework
- Supabase (PostgreSQL + Auth)
- RESTful API architecture

### Integrations
- **Monoova**: Payment gateway
- **Basiq**: CDR bank data aggregation
- **LodgeIT**: ATO tax lodgement

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- Git
- Supabase account
- API keys for Monoova, Basiq, LodgeIT

### Installation

```bash
# Clone the repository
git clone https://github.com/yourorg/accounting-software.git
cd accounting-software

# Verify your setup is ready
./scripts/verify-setup.sh        # Linux/Mac
# OR
.\scripts\verify-setup.ps1       # Windows PowerShell

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or manually:

# 1. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run migrate
npm run dev

# 2. Setup frontend (React version)
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Environment Variables

**Backend (.env)**
```
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Monoova
MONOOVA_API_KEY=your_monoova_key
MONOOVA_BASE_URL=https://api.monoova.com

# Basiq
BASIQ_API_KEY=your_basiq_key

# LodgeIT
LODGEIT_API_KEY=your_lodgeit_key
LODGEIT_BASE_URL=https://api.lodgeit.net.au

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Development

### Running locally

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Database Migrations

```bash
cd backend
npm run migrate        # Run migrations
npm run migrate:rollback  # Rollback last migration
npm run migrate:fresh  # Fresh migration with seeds
```

### Testing

```bash
# Backend tests
cd backend
npm test
npm run test:watch
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:e2e
```

## Project Structure

```
accounting-software/
├── .github/workflows/     # CI/CD pipelines
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── models/       # Data models
│   │   └── utils/        # Utilities
│   └── tests/            # Backend tests
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API clients
│   │   ├── pages/        # Page components
│   │   └── utils/        # Utilities
│   └── tests/            # Frontend tests
├── database/
│   ├── migrations/       # SQL migrations
│   └── seeds/            # Seed data
├── docs/                 # Documentation
└── scripts/              # Setup and deployment scripts
```

## API Documentation

API documentation is available at:
- Development: http://localhost:3001/api-docs
- Production: https://api.yourapp.com/api-docs

See [docs/API.md](docs/API.md) for detailed endpoint documentation.

## Deployment

### Backend Deployment (Railway/Render)

```bash
# Using Railway CLI
railway login
railway init
railway up

# Or using Docker
docker build -t accounting-backend ./backend
docker run -p 3001:3001 accounting-backend
```

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourorg/accounting-software/issues
- Documentation: https://docs.yourapp.com
- Email: support@yourapp.com

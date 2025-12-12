#!/bin/bash

set -e

echo "========================================="
echo "Accounting Software Setup"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm --version) detected${NC}"
echo ""

# Setup Backend
echo "Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating backend .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit backend/.env with your credentials${NC}"
else
    echo -e "${GREEN}✓ Backend .env already exists${NC}"
fi

echo "Installing backend dependencies..."
npm install

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Setup Frontend
echo "Setting up frontend..."
cd ../frontend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating frontend .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit frontend/.env with your credentials${NC}"
else
    echo -e "${GREEN}✓ Frontend .env already exists${NC}"
fi

echo "Installing frontend dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Create logs directory
cd ..
mkdir -p backend/logs
echo -e "${GREEN}✓ Created logs directory${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and frontend/.env with your credentials"
echo "2. Setup your Supabase project and run migrations"
echo "3. Start the development servers:"
echo ""
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "4. Access the application at http://localhost:5173"
echo ""

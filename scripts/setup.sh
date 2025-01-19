#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setting up Job Application Automation System...${NC}"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm is required but not installed.${NC}" >&2; exit 1; }

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Creating environment files...${NC}"
    cp .env.example .env
    echo "Please update .env with your credentials"
fi

# Install and initialize Supabase
echo -e "${BLUE}🗄️ Setting up Supabase...${NC}"
npm run supabase:install

# Start Supabase services
echo -e "${BLUE}🚀 Starting Supabase services...${NC}"
npm run supabase:start

# Wait for Supabase to be ready
echo -e "${BLUE}⏳ Waiting for Supabase to be ready...${NC}"
sleep 10

# Initialize database
echo -e "${BLUE}💾 Initializing database...${NC}"
npm run db:reset

# Setup storage buckets
echo -e "${BLUE}📦 Setting up storage buckets...${NC}"
npm run storage:setup

echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env with your credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Visit http://localhost:5173"
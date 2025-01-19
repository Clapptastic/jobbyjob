#!/bin/bash

# Create production build
echo "Creating production build..."
npm run build

# Create directories
mkdir -p ./dist/docker
mkdir -p ./dist/supabase
mkdir -p ./dist/scripts
mkdir -p ./dist/nginx

# Copy Docker files
cp Dockerfile Dockerfile.dev Dockerfile.prod docker-compose.yml docker-compose.dev.yml docker-compose.prod.yml .dockerignore ./dist/docker/

# Copy Nginx configs
cp -r nginx/* ./dist/nginx/

# Copy Supabase files
cp -r supabase/* ./dist/supabase/

# Copy scripts
cp scripts/*.sh ./dist/scripts/

# Copy environment files
cp .env.example ./dist/

# Copy documentation
cp README.md ./dist/

# Create archive
cd dist
zip -r ../job-application-system.zip ./*
cd ..

echo "Package created successfully: job-application-system.zip"
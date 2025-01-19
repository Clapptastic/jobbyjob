#!/bin/bash

# Build and deploy production environment
echo "Deploying production environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# Pull latest changes
git pull origin main

# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 10

# Check container health
docker-compose -f docker-compose.prod.yml ps -q | xargs docker inspect -f '{{.State.Health.Status}}' | grep -v healthy > /dev/null

if [ $? -eq 0 ]; then
    echo "Deployment failed! Containers are not healthy."
    docker-compose -f docker-compose.prod.yml logs
    exit 1
else
    echo "Deployment successful! Application is running."
fi
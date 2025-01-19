#!/bin/bash

# Check environment argument
if [ "$1" != "stage" ] && [ "$1" != "prod" ]; then
    echo "Usage: ./deploy-supabase.sh [stage|prod]"
    exit 1
fi

ENV=$1
DB_URL_VAR="${ENV}_DB_URL"

# Check if environment variables are set
if [ -z "${!DB_URL_VAR}" ]; then
    echo "Error: ${DB_URL_VAR} environment variable not set"
    exit 1
fi

echo "Deploying to ${ENV} environment..."

# Generate database diff
echo "Generating database diff..."
npm run db:diff

# Prompt for confirmation
read -p "Review the changes above. Continue with deployment? (y/N) " confirm
if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Deploy database changes
echo "Deploying database changes..."
npm run deploy:${ENV}

# Deploy Edge Functions
echo "Deploying Edge Functions..."
npm run functions:deploy

echo "Deployment complete! 🚀"
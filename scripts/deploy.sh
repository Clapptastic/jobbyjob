#!/bin/bash

# Check environment argument
if [ "$1" != "stage" ] && [ "$1" != "prod" ]; then
    echo "Usage: ./deploy.sh [stage|prod]"
    exit 1
fi

ENV=$1
echo "Deploying to ${ENV} environment..."

# Load environment variables
if [ "$ENV" = "prod" ]; then
    source .env.production
else
    source .env.staging
fi

# Build application
echo "Building application..."
npm run build

# Deploy to Netlify
echo "Deploying to Netlify..."
if [ "$ENV" = "prod" ]; then
    netlify deploy --prod
else
    netlify deploy
fi

# Deploy Edge Functions
echo "Deploying Edge Functions..."
npm run functions:deploy

echo "Deployment complete! 🚀"
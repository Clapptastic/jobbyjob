#!/bin/bash

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm run supabase:install
fi

# Initialize Supabase project
echo "Initializing Supabase project..."
npm run supabase:init

# Start local Supabase
echo "Starting local Supabase..."
npm run supabase:start

# Apply database migrations
echo "Applying database migrations..."
npm run db:reset

# Create storage buckets
echo "Creating storage buckets..."
supabase storage create resumes
supabase storage create avatars

# Deploy Edge Functions
echo "Deploying Edge Functions..."
npm run functions:deploy

echo "Supabase setup complete! 🚀"
echo "Run 'npm run dev' to start the development server."
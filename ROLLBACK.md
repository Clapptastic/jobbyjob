# Rollback Instructions

## Current Version
- Tag: v1.0.0-pwa
- Date: 2024-01-21

## How to Rollback

### Using Git
1. Fetch the latest tags:
   ```bash
   git fetch --all --tags
   ```

2. Check out the specific tag:
   ```bash
   git checkout v1.0.0-pwa
   ```

### Using Docker
1. Stop the current containers:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

2. Remove existing images:
   ```bash
   docker system prune -f
   ```

3. Pull and run the specific version:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

## Database Rollback
If needed, you can rollback the database migrations:

1. Using Supabase CLI:
   ```bash
   supabase db reset
   ```

2. Or manually revert the latest migration:
   ```sql
   -- Revert the parsed_resumes table
   DROP TABLE IF EXISTS parsed_resumes;
   ```

## Environment Variables
Make sure to keep a backup of your `.env` file before rolling back. The current version uses the following critical variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_OPENAI_API_KEY

## Contact
If you encounter any issues during rollback, please contact the development team.

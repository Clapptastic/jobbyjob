## Supabase Edge Functions Setup Guide

### Automated Setup

1. Deploy all functions using the CLI:
```bash
npm run functions:deploy
```

This will:
- Deploy all Edge Functions
- Set environment variables
- Configure function settings

### Manual Setup

If automated setup fails, follow these steps:

1. **Install Supabase CLI**
```bash
npm install -g supabase
```

2. **Login to Supabase**
```bash
supabase login
```

3. **Initialize Supabase project**
```bash
supabase init
```

4. **Deploy individual functions**
```bash
# Deploy parse-resume function
supabase functions deploy parse-resume

# Deploy generate-cover-letter function
supabase functions deploy generate-cover-letter

# Deploy calculate-job-match function
supabase functions deploy calculate-job-match

# Deploy optimize-resume function
supabase functions deploy optimize-resume

# Deploy scrape-jobs function
supabase functions deploy scrape-jobs

# Deploy process-applications function
supabase functions deploy process-applications
```

5. **Set environment variables**
```bash
# Set OpenAI API key for all functions
supabase secrets set --env-file .env OPENAI_API_KEY=your-api-key

# Set function-specific variables if needed
supabase secrets set --env-file .env SCRAPER_API_KEY=your-scraper-key -f scrape-jobs
```

6. **Verify deployment**
```bash
# List all deployed functions
supabase functions list

# Get function logs
supabase functions logs parse-resume
```

### Function Details

1. **parse-resume**
   - Purpose: Parse uploaded resumes using GPT-4
   - Memory: 1024MB
   - Timeout: 30s

2. **generate-cover-letter**
   - Purpose: Create customized cover letters
   - Memory: 1024MB
   - Timeout: 30s

3. **calculate-job-match**
   - Purpose: Score job matches against resumes
   - Memory: 1024MB
   - Timeout: 30s

4. **optimize-resume**
   - Purpose: Tailor resumes for specific jobs
   - Memory: 1024MB
   - Timeout: 30s

5. **scrape-jobs**
   - Purpose: Scrape job listings from various sources
   - Memory: 2048MB
   - Timeout: 60s

6. **process-applications**
   - Purpose: Handle automated job applications
   - Memory: 1024MB
   - Timeout: 30s

### Troubleshooting

1. **Function deployment fails**
   ```bash
   # Check function logs
   supabase functions logs function-name

   # Verify function configuration
   supabase functions config function-name
   ```

2. **Environment variables not working**
   ```bash
   # List all secrets
   supabase secrets list

   # Reset secrets
   supabase secrets unset VARIABLE_NAME
   supabase secrets set VARIABLE_NAME=new_value
   ```

3. **Function timeout issues**
   ```bash
   # Update function configuration
   supabase functions config function-name --memory 2048 --timeout 60
   ```

### Development Tips

1. **Local testing**
   ```bash
   # Serve function locally
   supabase functions serve function-name

   # Test with curl
   curl -i --location --request POST 'http://localhost:54321/functions/v1/function-name' \
   --header 'Authorization: Bearer your-anon-key' \
   --header 'Content-Type: application/json' \
   --data '{"test": true}'
   ```

2. **Monitoring**
   ```bash
   # Watch function logs
   supabase functions logs function-name --tail

   # Get function metrics
   supabase functions metrics function-name
   ```

3. **Updating functions**
   ```bash
   # Update single function
   supabase functions deploy function-name --no-verify-jwt

   # Update all functions
   npm run functions:deploy
   ```
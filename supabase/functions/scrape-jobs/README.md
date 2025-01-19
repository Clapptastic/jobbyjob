# Job Scraping Edge Function

This Supabase Edge Function scrapes job listings from multiple job sites and matches them against a user's resume using AI.

## Features

- Scrapes LinkedIn and Indeed job listings
- Uses OpenAI GPT-4 for job matching
- Supports location and remote work preferences
- Returns sorted jobs by match score

## Environment Variables

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: Your OpenAI API key

## Deployment

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Deploy the function:
   ```bash
   supabase functions deploy scrape-jobs
   ```

4. Set environment variables:
   ```bash
   supabase secrets set OPENAI_API_KEY=your-api-key
   ```

## Usage

Call the function with job preferences and resume content:

```typescript
const response = await fetch('https://your-project.functions.supabase.co/scrape-jobs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    preferences: {
      keywords: ['software engineer', 'frontend'],
      zipCode: '94105',
      radius: 25,
      remote: true,
    },
    resumeContent: '...',
  }),
})

const jobs = await response.json()
```
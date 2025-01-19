# Supabase Integration Guide 🗄️

## Prerequisites

1. **Supabase Account**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Save project URL and API keys

2. **Required Credentials**
   - Project URL (format: `https://<project>.supabase.co`)
   - Anon/Public key (starts with `eyJ`)
   - Service Role key (for initial setup only)

## Development Setup

### Environment Variables
```bash
# Development (.env)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Optional, for setup only
```

### Credential Storage
- Development mode:
  - Credentials stored in localStorage
  - Auto-populated in SecretsManager
  - Persists across sessions
- Production mode:
  - Uses environment variables
  - No local storage

### Connection Validation
```typescript
// Validate credentials format
const issues = verifyCredentialsFormat(url, anonKey, serviceKey);
if (issues.length > 0) {
  throw new Error(`Invalid credentials: ${issues.join(', ')}`);
}

// Test connection with retries
const isConnected = await checkConnection();
if (!isConnected) {
  throw new Error('Failed to connect to Supabase');
}
```

## Database Schema

### Required Tables
```sql
-- Profiles
create table public.profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  resume_url text,
  resume_content jsonb,
  linkedin_url text,
  personal_website text,
  job_preferences jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs
create table public.jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  title text not null,
  company text not null,
  location text not null,
  type text,
  description text,
  requirements text[],
  posted_at timestamptz default now(),
  source text not null,
  source_url text unique,
  match_score real,
  match_reasons jsonb,
  active boolean default true
);

-- Applications
create table public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  job_id uuid references public.jobs,
  status text default 'applied',
  applied_at timestamptz default now(),
  last_contact_at timestamptz,
  customized_resume text,
  notes text
);

-- API Keys
create table public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  provider text unique not null,
  key_value text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Storage Buckets
- resumes (private)
  - 5MB limit
  - PDF, DOC, DOCX only
- avatars (public)
  - 2MB limit
  - JPG, PNG, GIF only

## Error Handling

### Common Issues
1. **Invalid Credentials**
   - URL must be `https://<project>.supabase.co`
   - Keys must start with `eyJ`
   - Check dashboard for correct values

2. **Connection Failed**
   - Verify project status
   - Check network connection
   - Try connection test

3. **Storage Issues**
   - Enable storage service
   - Verify bucket configuration
   - Check permissions

## Best Practices

1. **Security**
   - Never commit credentials
   - Rotate service role key regularly
   - Use RLS policies

2. **Development**
   - Use local storage in dev mode
   - Clear invalid credentials
   - Handle connection retries

3. **Testing**
   - Validate schema regularly
   - Test permissions
   - Monitor API usage

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord Community](https://discord.gg/your-server)
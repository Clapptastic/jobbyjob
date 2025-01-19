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

### Client Configuration
```typescript
// src/lib/supabaseClient.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'jobbyjob@1.0.0'
    }
  }
});
```

### Health Checks
The application uses a simple query to check database connectivity:
```typescript
export const checkHealth = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    return !error;
  } catch (err) {
    log.error('Health check failed:', err);
    return false;
  }
};
```

### Credential Storage
- Development mode:
  - Credentials stored in localStorage
  - Auto-populated in SecretsManager
  - Persists across sessions
- Production mode:
  - Uses environment variables
  - No local storage
- Docker mode:
  - Only uses environment variables
  - Enhanced security for containerized deployments

### Connection Validation
```typescript
// Validate credentials format
const issues = verifyCredentialsFormat(url, anonKey, serviceKey);
if (issues.length > 0) {
  throw new Error(`Invalid credentials: ${issues.join(', ')}`);
}

// Test connection with retries
const isConnected = await checkConnection(3);
if (!isConnected) {
  throw new Error('Failed to connect to database');
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
   - Check URL format (must be `https://<project>.supabase.co`)
   - Verify key format (must start with `eyJ`)
   - Ensure credentials are not placeholder values

2. **Connection Issues**
   - Check network connectivity
   - Verify project status in Supabase dashboard
   - Check for rate limiting or IP restrictions

3. **Authentication Issues**
   - Clear local storage cache if needed
   - Check token expiration
   - Verify auth configuration

### Troubleshooting Steps
1. **Client Initialization**
   - Verify environment variables
   - Check credential format
   - Monitor initialization logs

2. **Connection Issues**
   - Check network connectivity
   - Verify Supabase project status
   - Review error logs

3. **Data Access**
   - Verify table permissions
   - Check RLS policies
   - Monitor query performance

## Best Practices

1. **Security**
   - Never expose service role key in client
   - Use RLS policies for data access
   - Implement proper auth flows

2. **Performance**
   - Use connection pooling
   - Implement query caching
   - Monitor API usage

3. **Maintenance**
   - Regular health checks
   - Monitor error rates
   - Keep dependencies updated

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord Community](https://discord.gg/your-server)
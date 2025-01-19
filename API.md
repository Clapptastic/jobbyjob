# API Reference 📚

## Required APIs

### Supabase API (Required)
- **Purpose**: Database and storage
- **Required Keys**:
  - Project URL (format: `https://<project>.supabase.co`)
  - Anon/Public key (format: starts with `eyJ`)
  - Service Role key (format: starts with `eyJ`) - for setup only

### OpenAI API (Required)
- **Purpose**: Core AI functionality
- **Format**: Starts with `sk-`
- **Features**:
  - Resume parsing
  - Job matching
  - Cover letter generation

### Affinda API (Optional)
- **Purpose**: Enhanced resume parsing
- **Format**: 64-character string
- **Features**:
  - Professional resume parsing
  - Data extraction
  - Format conversion

## Database Schema

### Profiles
```sql
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
```

### Jobs
```sql
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
```

### Applications
```sql
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
```

### API Keys
```sql
create table public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  provider text unique not null,
  key_value text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Error Handling

### API Errors
```typescript
try {
  await operation();
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    handleRateLimit(error);
  } else if (error.code === 'invalid_api_key') {
    promptForNewKey();
  } else {
    logError(error);
  }
}
```

### Database Errors
```typescript
try {
  await dbOperation();
} catch (error) {
  if (error.code === '23505') { // Unique violation
    handleDuplicate(error);
  } else if (error.code === '42501') { // Permission denied
    handlePermissionError(error);
  } else {
    logError(error);
  }
}
```

## Testing

### Connection Test
```typescript
const isConnected = await checkConnection();
if (!isConnected) {
  throw new Error('Database connection failed');
}
```

### Schema Validation
```typescript
const { valid, errors } = await databaseValidator.validateSchema();
if (!valid) {
  console.error('Schema validation failed:', errors);
}
```

### Permission Test
```typescript
const { valid, errors } = await databaseValidator.validatePermissions();
if (!valid) {
  console.error('Permission validation failed:', errors);
}
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Affinda API Documentation](https://docs.affinda.com/reference)
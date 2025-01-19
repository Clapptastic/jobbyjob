## API Permissions Guide ✅

### Required Permissions

#### Supabase
- [ ] Admin access to project
- [ ] Service Role Key for setup
- [ ] Anon Key for client usage
- [ ] Database access enabled
- [ ] Storage service enabled
- [ ] Edge Functions enabled
- [ ] Authentication enabled

#### Affinda (Required)
- [ ] Valid API key from [Affinda Console > API Keys](https://api.affinda.com/auth/login)
- [ ] Resume parser access
- [ ] Sufficient usage quota
- [ ] Billing enabled (for production)

#### OpenAI (Required)
- [ ] Valid API key from [OpenAI API Keys](https://platform.openai.com/api-keys)
- [ ] GPT-4 access (recommended)
- [ ] Sufficient usage quota
- [ ] Billing enabled (for production)

#### Optional Providers
- [ ] [Anthropic Console > API Keys](https://console.anthropic.com/account/keys)
- [ ] [Cohere Dashboard > API Keys](https://dashboard.cohere.com/api-keys)
- [ ] [Google AI Studio > API Keys](https://makersuite.google.com/app/apikey)

### Setup Steps

1. **Get Supabase Keys**
   - [ ] Go to [Project Settings > API](https://supabase.com/dashboard/project/_/settings/api)
   - [ ] Copy Service Role Key
   - [ ] Copy Anon Key

2. **Get Affinda Key**
   - [ ] Go to [Affinda Console > API Keys](https://api.affinda.com/auth/login)
   - [ ] Create new API key
   - [ ] Copy 64-character key
   - [ ] Enable resume parsing

3. **Get OpenAI Key**
   - [ ] Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - [ ] Create new secret key
   - [ ] Enable required models
   - [ ] Set usage limits

4. **Configure Environment**
   - [ ] Create .env file
   - [ ] Add Supabase URL
   - [ ] Add Service Role Key
   - [ ] Add Affinda key
   - [ ] Add OpenAI key

5. **Run Setup**
   - [ ] Run npm run setup
   - [ ] Verify services enabled
   - [ ] Check database initialized
   - [ ] Confirm storage buckets
   - [ ] Test Edge Functions

### Common Issues

1. **Affinda Access**
   ```
   Error: Invalid API key format
   Solution: Ensure key is 64 characters long
   ```

2. **OpenAI Access**
   ```
   Error: Invalid API key
   Solution: Key must start with 'sk-'
   ```

3. **Database Access**
   ```
   Error: Permission denied
   Solution: Use Service Role Key during setup
   ```

4. **Storage Access**
   ```
   Error: Bucket creation failed
   Solution: Enable storage service in dashboard
   ```
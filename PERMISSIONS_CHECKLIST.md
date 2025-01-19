## API Permissions Checklist ✅

### Required Permissions

#### Supabase
- [ ] Admin access to project
- [ ] Service Role Key for setup
- [ ] Anon Key for client usage
- [ ] Database access enabled
- [ ] Storage service enabled
- [ ] Edge Functions enabled
- [ ] Authentication enabled

#### OpenAI
- [ ] Valid API key
- [ ] GPT-4 access (recommended)
- [ ] Sufficient usage quota
- [ ] Billing enabled (for production)

### Setup Steps

1. **Get Supabase Keys**
   - [ ] Go to Project Settings
   - [ ] Navigate to API section
   - [ ] Copy Service Role Key
   - [ ] Copy Anon Key

2. **Get OpenAI Key**
   - [ ] Go to API Keys section
   - [ ] Create new secret key
   - [ ] Enable required models
   - [ ] Set usage limits

3. **Configure Environment**
   - [ ] Create .env file
   - [ ] Add Supabase URL
   - [ ] Add Service Role Key
   - [ ] Add OpenAI key

4. **Run Setup**
   - [ ] Run npm run setup
   - [ ] Verify services enabled
   - [ ] Check database initialized
   - [ ] Confirm storage buckets
   - [ ] Test Edge Functions

5. **Post-Setup**
   - [ ] Replace Service Role Key with Anon Key
   - [ ] Test authentication
   - [ ] Verify file uploads
   - [ ] Check AI features

### Common Issues

1. **Database Access**
   ```
   Error: Permission denied
   Solution: Use Service Role Key during setup
   ```

2. **Storage Access**
   ```
   Error: Bucket creation failed
   Solution: Enable storage service in dashboard
   ```

3. **Edge Functions**
   ```
   Error: Function deployment failed
   Solution: Enable Edge Functions in project
   ```

4. **OpenAI Access**
   ```
   Error: Model not available
   Solution: Enable required models in OpenAI dashboard
   ```
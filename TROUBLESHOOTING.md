# Troubleshooting Guide 🔧

## Database Connection Issues

### Invalid Credentials Format
```
Error: Invalid credentials format
```
**Solution:**
1. Check URL format:
   - Must be `https://<project>.supabase.co`
   - Copy directly from Supabase dashboard
2. Check key formats:
   - Anon key must start with `eyJ`
   - Service role key must start with `eyJ`
3. In development:
   - Clear localStorage
   - Re-enter credentials in SecretsManager

### Connection Failed
```
Error: Failed to connect to Supabase
```
**Solution:**
1. Verify project status in dashboard
2. Check network connection
3. Try connection test:
   ```bash
   npm run verify
   ```

## API Integration Issues

### OpenAI API
```
Error: Failed to parse resume with OpenAI
```
**Solution:**
1. Verify API key format (starts with `sk-`)
2. Check API quota
3. Monitor rate limits
4. Ensure valid file content

### Affinda API
```
Error: Failed to parse resume with Affinda
```
**Solution:**
1. Verify API key (64-character string)
2. Check file format support
3. Monitor API rate limits
4. Check network connectivity

## Storage Issues

### Upload Failed
```
Error: Failed to upload file
```
**Solution:**
1. Check file size limits:
   - Resumes: 5MB max
   - Avatars: 2MB max
2. Verify file types:
   - Resumes: PDF, DOC, DOCX
   - Avatars: JPG, PNG, GIF
3. Check storage permissions

### Bucket Not Found
```
Error: Storage bucket not found
```
**Solution:**
1. Enable storage service
2. Create required buckets:
   ```sql
   insert into storage.buckets (id, name, public)
   values ('resumes', 'resumes', false),
          ('avatars', 'avatars', true);
   ```
3. Verify bucket configuration

## Development Issues

### Local Storage
```
Error: Failed to store credentials
```
**Solution:**
1. Clear browser storage:
   ```javascript
   localStorage.clear();
   ```
2. Reload application
3. Re-enter credentials

### Build Errors
```
Error: Build failed
```
**Solution:**
1. Clear dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Check TypeScript errors:
   ```bash
   npm run typecheck
   ```
3. Verify environment variables

## Testing Issues

### Test Failures
```
Error: Test suite failed
```
**Solution:**
1. Check test environment:
   ```bash
   npm run test:environment
   ```
2. Update test credentials
3. Verify database state

### E2E Test Failures
```
Error: Playwright test failed
```
**Solution:**
1. Install browsers:
   ```bash
   npx playwright install
   ```
2. Update test config
3. Check test user credentials

## Support Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Affinda API](https://docs.affinda.com)

### Community
- GitHub Issues
- Discord Server
- Stack Overflow
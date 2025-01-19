# Troubleshooting Guide 🔧

## Common Issues

### Supabase Connection Issues

1. **Health Check Failures**
   ```
   workbox Precaching did not find a match for /@vite/client
   ```
   - This is expected in development mode
   - The service worker is configured to handle these requests
   - No action needed

2. **404 on _health Endpoint**
   ```
   GET https://[project].supabase.co/rest/v1/_health 404 (Not Found)
   ```
   - This is expected behavior
   - The application uses a custom health check query instead
   - No action needed

3. **Multiple Client Instances**
   ```
   Multiple GoTrueClient instances detected
   ```
   - This warning can be safely ignored in development
   - The application handles client initialization properly
   - No action needed

### Database Connection

1. **Connection Failed**
   ```typescript
   // Check connection status
   const isConnected = await checkConnection(3);
   if (!isConnected) {
     // Handle connection failure
   }
   ```
   - Verify environment variables
   - Check network connectivity
   - Ensure Supabase project is active

2. **Invalid Credentials**
   ```typescript
   // Validate credentials
   const issues = verifyCredentialsFormat(url, anonKey);
   if (issues.length > 0) {
     // Handle invalid credentials
   }
   ```
   - Check URL format
   - Verify key format
   - Update credentials if needed

### Development Mode

1. **Local Storage Issues**
   - Clear browser storage:
     ```typescript
     localStorage.removeItem('sb-refresh-token');
     localStorage.removeItem('sb-access-token');
     localStorage.removeItem('supabase.auth.token');
     ```
   - Reinitialize client:
     ```typescript
     await reinitialize();
     ```

2. **Docker Mode**
   - Environment variables only
   - No local storage used
   - Check docker-compose files

## Performance Issues

### Service Worker

1. **Cache Configuration**
   ```typescript
   // Cache static assets
   registerRoute(
     ({ request }) => {
       return request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'image';
     },
     new StaleWhileRevalidate({
       cacheName: 'static-resources'
     })
   );
   ```
   - Check cache configuration
   - Monitor cache size
   - Clear cache if needed

2. **API Requests**
   ```typescript
   // Don't cache Supabase requests
   registerRoute(
     ({ url }) => url.hostname.includes('supabase'),
     new NetworkOnly()
   );
   ```
   - Verify routing patterns
   - Check network requests
   - Monitor API usage

## Security Issues

### Authentication

1. **Token Management**
   ```typescript
   const client = createClient(url, key, {
     auth: {
       autoRefreshToken: true,
       persistSession: true,
       detectSessionInUrl: true
     }
   });
   ```
   - Check token expiration
   - Verify refresh token flow
   - Monitor auth state

2. **Permissions**
   - Verify RLS policies
   - Check role assignments
   - Monitor access patterns

## Monitoring

### Health Checks

1. **Database Health**
   ```typescript
   export const checkHealth = async () => {
     try {
       const { error } = await supabase
         .from('profiles')
         .select('count')
         .limit(1)
         .single();
       return !error;
     } catch (err) {
       return false;
     }
   };
   ```
   - Monitor success rate
   - Check error patterns
   - Set up alerts

2. **Error Logging**
   ```typescript
   log.error('Health check failed:', error);
   ```
   - Review error logs
   - Track error frequency
   - Set up notifications

## Support Resources

1. **Documentation**
   - [Supabase Docs](https://supabase.com/docs)
   - [Workbox Docs](https://developers.google.com/web/tools/workbox)
   - Project README

2. **Community**
   - GitHub Issues
   - Discord Server
   - Stack Overflow

3. **Tools**
   - Browser DevTools
   - Supabase Dashboard
   - Logging System
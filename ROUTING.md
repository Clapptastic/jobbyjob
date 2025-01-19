# Routing Guide 🗺️

## Route Structure

```
/                   → Root (redirects based on auth state)
├── /login          → Login page
├── /signup         → Signup page
├── /reset-password → Password reset
├── /auth/callback  → Auth callback handler
├── /request-access → Access request form
├── /dashboard/*    → Protected dashboard routes
└── /admin/*        → Protected admin routes
```

## Route Guards

1. **AuthGuard**
   - Protects dashboard routes
   - Verifies user session
   - Redirects to login if unauthorized

2. **AdminGuard**
   - Protects admin routes
   - Verifies admin privileges
   - Redirects to dashboard if unauthorized

## Navigation Flow

1. **Initial Load**
   - Check Supabase credentials
   - Show SecretsManager if needed
   - Verify database connection

2. **Authentication**
   - Login → Dashboard
   - Signup → Email verification
   - Access Request → Approval workflow

3. **Protected Routes**
   - Requires valid session
   - Automatic redirect if unauthorized
   - Session persistence

## Best Practices

1. **Always use replace for redirects**
   ```typescript
   navigate('/dashboard', { replace: true })
   ```

2. **Handle loading states**
   ```typescript
   if (isChecking) {
     return <LoadingScreen />
   }
   ```

3. **Protect sensitive routes**
   ```typescript
   <AuthGuard>
     <ProtectedComponent />
   </AuthGuard>
   ```

4. **Error Handling**
   ```typescript
   if (error) {
     return <DatabaseError error={error} onRetry={handleRetry} />
   }
   ```
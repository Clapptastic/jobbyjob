# Authentication Guide 🔐

## Overview

Authentication is handled by Supabase Auth with:
- Email/password authentication
- Email verification via SMTP
- Password reset
- Session management

## Email Provider Setup

### SendGrid (Recommended)
```env
VITE_EMAIL_PROVIDER=sendgrid
VITE_SENDGRID_API_KEY=SG.your-api-key
```

### Mandrill (Alternative)
```env
VITE_EMAIL_PROVIDER=mandrill
VITE_MANDRILL_API_KEY=md-your-api-key
```

## Setup Steps

1. **Enable Auth Service**
   - Go to Supabase Dashboard
   - Select your project
   - Navigate to Authentication > Settings
   - Enable Email auth provider

2. **Configure SMTP**
   ```sql
   select setup_smtp_auth(
     'sendgrid',  -- or 'mandrill'
     'your-api-key',
     'noreply@yourdomain.com',
     'ClappCode'
   );
   ```

3. **Configure Email Templates**
   - Go to Authentication > Email Templates
   - Customize:
     - Confirmation Email
     - Reset Password Email
     - Magic Link Email
     - Change Email Address

4. **Set Environment Variables**
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Usage

### Sign Up
```typescript
await auth.signUp(email, password);
```

### Sign In
```typescript
await auth.signIn(email, password);
```

### Password Reset
```typescript
await auth.resetPassword(email);
```

### Sign Out
```typescript
await auth.signOut();
```

## Protected Routes

Use AuthGuard component:
```typescript
<Route
  path="/dashboard"
  element={
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  }
/>
```

## Email Verification Flow

1. **User Registration**
   - User submits signup form
   - Account created (unconfirmed)
   - Verification email sent

2. **Email Verification**
   - User clicks verification link
   - Token validated
   - Account confirmed
   - Redirect to login

3. **Password Reset**
   - User requests reset
   - Reset email sent
   - User sets new password
   - Session updated

## Session Management

Sessions are automatically handled by Supabase Auth:
- JWT tokens
- Refresh tokens
- Auto refresh
- Secure storage

## Error Handling

Auth errors are logged and displayed to users via toast notifications:

```typescript
try {
  await auth.signUp(email, password);
} catch (error) {
  toast.error('Failed to create account');
  logger.error('Signup error:', error);
}
```

## Security Best Practices

1. **Password Requirements**
   - Minimum 8 characters
   - Mix of letters/numbers
   - Special characters

2. **Rate Limiting**
   - Login attempts
   - Password resets
   - Email verification

3. **Session Security**
   - Short token expiry
   - Secure cookie storage
   - HTTPS only

## Testing

### Unit Tests
```typescript
test('signup validation', () => {
  expect(validateSignup(validData)).toBe(true);
  expect(validateSignup(invalidData)).toBe(false);
});
```

### Integration Tests
```typescript
test('auth flow', async () => {
  await signUp(testUser);
  await verifyEmail(token);
  await signIn(testUser);
  expect(isAuthenticated()).toBe(true);
});
```

## Troubleshooting

### Common Issues

1. **Email Not Received**
   - Check spam folder
   - Verify email address
   - Check SMTP settings

2. **Invalid Token**
   - Token expired
   - Already used
   - Malformed URL

3. **Session Issues**
   - Clear local storage
   - Check token expiry
   - Verify credentials

## Support Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [SendGrid Docs](https://sendgrid.com/docs)
- [Mandrill Docs](https://mailchimp.com/developer/transactional/docs)
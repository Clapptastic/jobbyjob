# Email Verification Guide 📧

## Overview

The application uses Supabase Auth with SMTP for email verification, supporting two providers:
- SendGrid (recommended)
- Mandrill (alternative)

## Provider Setup

### SendGrid Setup

1. **Create API Key**
   ```bash
   # Environment variables
   VITE_EMAIL_PROVIDER=sendgrid
   VITE_SENDGRID_API_KEY=SG.your-api-key
   ```

2. **Configure Templates**
   - Verification Email
   - Password Reset
   - Email Change
   - Magic Link

3. **SMTP Settings**
   ```plaintext
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your API Key]
   ```

### Mandrill Setup

1. **Create API Key**
   ```bash
   # Environment variables
   VITE_EMAIL_PROVIDER=mandrill
   VITE_MANDRILL_API_KEY=md-your-api-key
   ```

2. **Configure Templates**
   - Create templates in Mandrill dashboard
   - Set merge variables
   - Enable click tracking

3. **SMTP Settings**
   ```plaintext
   Host: smtp.mandrillapp.com
   Port: 587
   Username: [Your Email]
   Password: [API Key]
   ```

## Email Templates

### Required Templates

1. **Confirmation Email**
   ```html
   Subject: Confirm Your Email
   <h2>Welcome to ClappCode!</h2>
   <p>Click the button below to confirm your email:</p>
   <a href="{{ .ConfirmationURL }}">Confirm Email</a>
   ```

2. **Password Reset**
   ```html
   Subject: Reset Your Password
   <h2>Password Reset Request</h2>
   <p>Click below to reset your password:</p>
   <a href="{{ .ResetURL }}">Reset Password</a>
   ```

3. **Email Change**
   ```html
   Subject: Confirm Email Change
   <h2>Email Change Request</h2>
   <p>Click below to confirm your new email:</p>
   <a href="{{ .ChangeURL }}">Confirm Change</a>
   ```

## Implementation

### Database Setup

1. **Initialize SMTP**
   ```sql
   select setup_smtp_auth(
     'sendgrid',
     'SG.your-api-key',
     'noreply@yourdomain.com',
     'ClappCode'
   );
   ```

2. **Configure Auth Settings**
   ```sql
   update auth.config
   set value = 'false'
   where key = 'MAILER_AUTOCONFIRM';
   ```

### Email Flow

1. **Sign Up**
   - User submits email/password
   - Verification email sent
   - Account pending confirmation

2. **Verification**
   - User clicks email link
   - Token validated
   - Account activated

3. **Password Reset**
   - User requests reset
   - Reset email sent
   - User sets new password

## Error Handling

### Common Issues

1. **Email Not Received**
   - Check spam folder
   - Verify email address
   - Check provider status

2. **Invalid Token**
   - Token expired
   - Already used
   - Malformed URL

3. **SMTP Errors**
   - Verify credentials
   - Check rate limits
   - Monitor bounces

## Best Practices

1. **Security**
   - Use secure SMTP
   - Expire tokens quickly
   - Rate limit requests

2. **User Experience**
   - Clear instructions
   - Mobile-friendly emails
   - Quick response times

3. **Maintenance**
   - Monitor delivery rates
   - Update templates
   - Track analytics

## Testing

### Local Testing

1. **Setup Test Environment**
   ```bash
   npm run test:email
   ```

2. **Test Cases**
   - New registration
   - Password reset
   - Email change
   - Invalid tokens

### Production Testing

1. **Verify Delivery**
   - Check provider logs
   - Monitor bounce rates
   - Track open rates

2. **Test All Flows**
   - Complete registration
   - Reset password
   - Change email
   - Handle errors

## Support

### Provider Support
- [SendGrid Support](https://support.sendgrid.com)
- [Mandrill Support](https://mandrillapp.com/support)

### Documentation
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
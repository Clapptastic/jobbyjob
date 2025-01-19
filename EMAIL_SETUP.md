# Email Configuration Guide 📧

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
   - Access Request

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

1. **Access Request**
   ```html
   Subject: Access Request Received
   <h2>New Access Request</h2>
   <p>Click below to review the request:</p>
   <a href="{{ .ReviewURL }}">Review Request</a>
   ```

2. **Access Approval**
   ```html
   Subject: Access Approved
   <h2>Your Access Request is Approved</h2>
   <p>Click below to create your account:</p>
   <a href="{{ .SignupURL }}">Create Account</a>
   ```

3. **Password Reset**
   ```html
   Subject: Reset Your Password
   <h2>Password Reset Request</h2>
   <p>Click below to reset your password:</p>
   <a href="{{ .ResetURL }}">Reset Password</a>
   ```

## Best Practices

1. **Setup**
   - Use dedicated sending domain
   - Configure SPF/DKIM
   - Set up domain authentication

2. **Monitoring**
   - Track delivery rates
   - Monitor bounces
   - Check spam scores

3. **Maintenance**
   - Rotate API keys
   - Update templates
   - Clean invalid emails

## Troubleshooting

### Common Issues

1. **Delivery Problems**
   - Verify API key
   - Check sending limits
   - Validate email format

2. **Template Issues**
   - Check variable syntax
   - Verify HTML structure
   - Test responsiveness

3. **Configuration Errors**
   - Validate credentials
   - Check environment variables
   - Verify provider settings
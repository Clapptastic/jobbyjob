# Email Configuration Guide 📧

## Supported Providers

1. **SendGrid**
   - API key starts with `SG.`
   - High deliverability
   - Comprehensive analytics

2. **Mandrill**
   - API key starts with `md-`
   - Transactional focus
   - Template support

## Setup Process

1. **Initial Configuration**
   - Choose provider
   - Enter API key
   - Configure sender details

2. **Email Templates**
   - Access Request Notification
   - Approval Confirmation
   - Password Reset
   - Application Updates

3. **Testing**
   - Send test email
   - Verify delivery
   - Check formatting

## Configuration Options

### Environment Variables
```env
VITE_EMAIL_API_KEY=your-api-key
VITE_EMAIL_FROM=noreply@yourdomain.com
VITE_EMAIL_FROM_NAME=ClappCode
```

### Admin Dashboard
- Email provider selection
- API key management
- Sender configuration
- Template customization

## Email Types

1. **System Notifications**
   - Access requests
   - Account verification
   - Password reset

2. **Application Updates**
   - Application submitted
   - Status changes
   - Interview requests

3. **Admin Alerts**
   - New access requests
   - System errors
   - Usage reports

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
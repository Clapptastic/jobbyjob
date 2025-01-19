# Admin Guide 👑

## Access

1. **Initial Setup**
   - Configure admin email in SecretsManager
   - This email will have exclusive admin access

2. **Login**
   - Sign in with admin email
   - Navigate to `/admin`

## Dashboard Features

### API Key Management
- Configure required providers:
  - OpenAI (Required)
  - Affinda (Optional)
- Monitor API usage
- Rotate keys regularly

### Access Requests
- View pending requests
- Approve/reject users
- View request history
- Email notifications

### System Statistics
- User metrics
- Application tracking
- Storage usage
- Error rates

### Error Monitoring
- Real-time error tracking
- Error distribution
- Resolution status
- Trend analysis

## API Configuration

1. **Required APIs**
   - OpenAI
     - Format: `sk-...`
     - Required for core AI features
   - Affinda (Optional)
     - Format: 64-character string
     - Enhanced resume parsing

2. **Configuration**
   - API key validation
   - Usage monitoring
   - Error tracking
   - Rate limiting

3. **Testing**
   - Verify API access
   - Test rate limits
   - Check error handling

## Security

- Admin access is email-based
- All actions are logged
- Session management
- IP tracking

## Best Practices

1. **Access Management**
   - Review requests promptly
   - Verify company details
   - Monitor usage patterns

2. **API Management**
   - Monitor usage limits
   - Rotate keys regularly
   - Track error rates

3. **System Monitoring**
   - Check error rates
   - Monitor storage usage
   - Track user activity

## Troubleshooting

### Common Issues

1. **API Issues**
   - Check key validity
   - Verify rate limits
   - Monitor quotas

2. **Access Requests**
   - Verify email configuration
   - Check notification settings
   - Monitor approval flow

3. **System Errors**
   - Check error logs
   - Verify configurations
   - Monitor resources
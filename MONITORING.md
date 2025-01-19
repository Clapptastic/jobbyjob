# Monitoring Guide 📊

## Overview

This guide covers monitoring, logging, and debugging the application in production.

## Error Logging

### Configuration

1. **Environment Setup**
```env
VITE_LOG_LEVEL=error
VITE_ENABLE_ERROR_REPORTING=true
```

2. **Log Levels**
- ERROR: Critical issues
- WARN: Important warnings
- INFO: General information
- DEBUG: Detailed debugging

### Error Reports

Errors are stored in the `error_reports` table with:
- Source
- Error code
- Message
- Stack trace
- User context
- Timestamp

## Monitoring Tools

### Application Health

1. **Health Checks**
```bash
# Check application health
curl http://localhost/health

# View container health
docker ps --format "{{.Names}}: {{.Status}}"
```

2. **Resource Monitoring**
```bash
# View resource usage
docker stats

# Check memory usage
docker system df
```

### Error Monitoring

1. **View Error Logs**
```bash
# Recent errors
npm run logs:errors

# Full error history
npm run logs:all
```

2. **Error Statistics**
```bash
# Error rate by source
npm run stats:errors

# Error trends
npm run stats:trends
```

## Debug Tools

### Development Mode

1. **Enable Debug Mode**
```typescript
await debugManager.saveConfig({
  enabled: true,
  logLevel: 'debug',
  showInConsole: true
});
```

2. **Debug Panel**
- View system status
- Monitor API calls
- Track performance
- Debug storage operations

### Production Debugging

1. **Enable Production Logs**
```bash
# Enable detailed logging
docker-compose -f docker-compose.prod.yml logs -f

# Filter by service
docker-compose logs app | grep ERROR
```

2. **Performance Monitoring**
```bash
# View slow queries
npm run db:analyze

# Check API performance
npm run api:stats
```

## Alert System

### Configuration

1. **Setup Alerts**
```typescript
// Error rate threshold
const ERROR_THRESHOLD = 0.05;

// Response time threshold
const RESPONSE_THRESHOLD = 1000;
```

2. **Alert Channels**
- Email notifications
- Discord webhooks
- Admin dashboard

### Alert Types

1. **Error Alerts**
- High error rate
- Critical errors
- Security issues

2. **Performance Alerts**
- Slow responses
- High resource usage
- API failures

## Support

### Documentation
- [Error Codes](./ERROR_CODES.md)
- [Metrics Guide](./METRICS.md)
- [Debug Guide](./DEBUG.md)

### Contact
- Technical Support: support@example.com
- Emergency: emergency@example.com
- Status Page: status.example.com
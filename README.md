# ClappCode - AI-Powered Job Application System 🚀

## Quick Start

1. **Prerequisites**
   - Node.js 20+
   - npm 10+
   - Docker (optional)

2. **Installation**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd clappcode

   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

3. **Configuration**
   - Click "Connect to Supabase" in the app
   - Enter your Supabase credentials:
     - Project URL (format: `https://<project>.supabase.co`)
     - Anon/Public key (starts with `eyJ`)
   - Configure API keys:
     - OpenAI API key (Required, starts with `sk-`)
     - Affinda API key (Optional, 64-character string)

## Features

- 🤖 AI-powered resume parsing and job matching
- 📝 Multi-resume management with version history
- 🔍 Automated job search using Open Resume integration
- 📊 Application tracking and analytics
- 📧 Email notifications for updates
- 🔐 Secure file storage
- 🎨 Beautiful cyberpunk-inspired UI

## Development

```bash
# Start development server
npm run dev

# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run integration tests
npm run test:integration

# Lint code
npm run lint
```

## Testing

The application includes comprehensive testing:
- Unit tests with Vitest
- Integration tests for API interactions
- E2E tests with Playwright
- Performance monitoring and error tracking

## Docker Support

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Testing
```bash
docker-compose -f docker-compose.test.yml up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up
```

## API Integration

### Required APIs
1. **OpenAI API**
   - Required for AI features
   - Must start with `sk-`
   - Configure in API Keys section

2. **Affinda API (Optional)**
   - Enhanced resume parsing
   - 64-character key format
   - Configure in API Keys section

### Job Search Integration
- Integrated with Open Resume API
- Supports multiple job boards
- Real-time job matching
- Automated application tracking

## Documentation

- [Installation Guide](INSTALL.md)
- [API Reference](API.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Deployment Guide](DEPLOYMENT.md)

## Support

- [Issue Tracker](https://github.com/your-repo/issues)
- [Documentation](docs/)
- [Discord Community](https://discord.gg/your-server)

## License

MIT License - see [LICENSE](LICENSE) for details
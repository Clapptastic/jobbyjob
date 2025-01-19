# Installation Guide 📦

## Prerequisites

1. **Node.js 20+**
   - Download from [nodejs.org](https://nodejs.org)
   - Required for development and build

2. **Supabase Account**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Get required credentials:
     - Project URL (format: `https://<project>.supabase.co`)
     - Anon/Public key (starts with `eyJ`)
     - Service Role key (for setup)

3. **Required API Keys**
   - OpenAI API key (Required)
     - Get from [platform.openai.com](https://platform.openai.com)
     - Must start with `sk-`
   - Affinda API key (Optional)
     - Get from [affinda.com](https://affinda.com)
     - 64-character string format

## Local Development Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd clappcode
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
   - Click "Connect to Supabase" in the app
   - Enter your Supabase credentials:
     - Project URL (format: `https://<project>.supabase.co`)
     - Anon/Public key (starts with `eyJ`)
   - Configure API keys:
     - OpenAI API key (Required)
     - Affinda API key (Optional)

4. **Verify Setup**
```bash
npm run verify
```

5. **Start Development Server**
```bash
npm run dev
```

## Docker Setup

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

## Testing

### Run All Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Integration Tests
```bash
npm run test:integration
```

## Troubleshooting

### Database Connection Issues
1. Check Supabase credentials format:
   - URL must be `https://<project>.supabase.co`
   - Keys must start with `eyJ`
2. Verify project status in Supabase dashboard
3. Run connection test:
   ```bash
   npm run verify
   ```

### API Key Issues
1. Verify key formats:
   - OpenAI: starts with `sk-`
   - Affinda: 64 characters
2. Check API quotas and limits
3. Test API access:
   ```bash
   npm run test:api
   ```

### Docker Issues
1. Check Docker installation:
   ```bash
   docker --version
   docker-compose --version
   ```
2. Verify port availability:
   ```bash
   lsof -i :5173
   ```
3. Check container logs:
   ```bash
   docker-compose logs
   ```

## Support

- [Documentation](docs/)
- [Issue Tracker](https://github.com/your-repo/issues)
- [Discord Community](https://discord.gg/your-server)
# JobbyJob 🚀

An AI-powered job search assistant that helps you find and apply to jobs efficiently.

## Features ✨

- 🤖 AI-powered job search and matching
- 📄 Resume parsing and optimization
- 🔍 Automated job discovery
- 📊 Application tracking
- 🔐 Secure credential management
- 🌐 PWA support with offline capabilities

## Tech Stack 🛠️

- **Frontend**: React + Vite + TypeScript
- **Backend**: Supabase
- **AI**: OpenAI GPT-4
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth
- **PWA**: Workbox + Vite PWA Plugin
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions

## Getting Started 🚀

1. **Prerequisites**
   - Node.js 18+
   - npm 9+
   - Supabase account
   - OpenAI API key

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/your-username/jobbyjob.git
   cd jobbyjob

   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env
   ```

3. **Configuration**
   ```bash
   # Configure Supabase
   npm run setup:supabase

   # Configure OpenAI
   npm run setup:ai
   ```

4. **Development**
   ```bash
   # Start development server
   npm run dev
   ```

## Docker Support 🐳

1. **Development**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Production**
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```

## PWA Features 📱

- Offline support
- Background sync
- Push notifications
- Installable app
- Automatic updates

### Service Worker Configuration

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

// Handle API requests
registerRoute(
  ({ url }) => url.hostname.includes('supabase'),
  new NetworkOnly()
);
```

## Database Connection 🗄️

```typescript
// Initialize Supabase client
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Health check
const checkHealth = async () => {
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

## Testing 🧪

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Component tests
npm run test:components
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Documentation 📚

- [Getting Started](./GETTING_STARTED.md)
- [Supabase Setup](./SUPABASE.md)
- [API Documentation](./API.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

## License 📄

MIT License - see [LICENSE](./LICENSE) for details

## Support 💬

- [GitHub Issues](https://github.com/your-username/jobbyjob/issues)
- [Discord Server](https://discord.gg/your-server)
- [Documentation](https://your-docs-site.com)
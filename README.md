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

The application is containerized using Docker and can be run in different environments:

### Development Environment

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build
```

Services:
- UI (Vite): http://localhost:5173
- API Server: http://localhost:3000
- OpenResume Parser: http://localhost:3001

### Production Environment

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up

# Rebuild and start
docker-compose -f docker-compose.prod.yml up --build
```

### Test Environment

```bash
# Run tests in Docker
docker-compose -f docker-compose.test.yml up
```

### Environment Variables in Docker

```bash
# .env.docker
VITE_DOCKER=true
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPEN_RESUME_URL=http://localhost:3001
```

### Health Checks

The Docker configuration includes health checks for all services to ensure they are running correctly:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5173"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
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
// Initialize Supabase client with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

// Create client with enhanced configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'jobbyjob@1.0.0'
    }
  }
});

// Comprehensive health check
const checkHealth = async () => {
  try {
    // Check database connection
    const { error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (dbError) return false;

    // Check auth service
    const { error: authError } = await supabase.auth.getSession();
    if (authError) return false;

    return true;
  } catch (err) {
    return false;
  }
};

// Connection retry with exponential backoff
const checkConnection = async (retries = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    if (await checkHealth()) return true;
    await new Promise(resolve => 
      setTimeout(resolve, Math.pow(2, i) * 1000)
    );
  }
  return false;
};
```

### Environment Variables

```bash
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DOCKER=true  # When running in Docker
```

## Testing 🧪

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e        # End-to-end tests
npm run test:components # Component tests

# Run tests with UI
npm run test:e2e:ui

# Generate coverage report
npm run test:coverage
```

### Test Environment Setup

```typescript
// Component test setup
import { renderWithProviders } from './utils/test-utils';
import { test, expect, vi } from 'vitest';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signIn: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn()
    },
    storage: {
      from: vi.fn()
    }
  })
}));

// E2E test setup
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticated: async ({ page }, use) => {
    // Setup auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('sb-access-token', 'test-token');
    });
    await use(true);
    // Cleanup
    await page.evaluate(() => {
      localStorage.clear();
    });
  }
});
```

### Docker Test Environment

```bash
# Run tests in Docker
docker-compose -f docker-compose.test.yml up
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
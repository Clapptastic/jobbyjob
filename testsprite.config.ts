import { TestSpriteConfig } from './src/tests/utils/mock-testsprite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: TestSpriteConfig = {
  projectRoot: __dirname,
  configPath: join(__dirname, 'testsprite.config.ts'),
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  uiUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  endpoints: {
    auth: {
      login: '/auth/login',
      signup: '/auth/signup',
      logout: '/auth/logout'
    },
    resume: {
      upload: '/resume/upload',
      parse: '/resume/parse',
      analyze: '/resume/analyze'
    },
    jobs: {
      search: '/jobs/search',
      apply: '/jobs/apply',
      status: '/jobs/status'
    }
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  },
  testCases: {
    api: {
      auth: [
        'Should successfully sign up a new user',
        'Should successfully log in an existing user',
        'Should handle invalid credentials'
      ],
      resume: [
        'Should upload resume successfully',
        'Should parse resume content',
        'Should analyze resume skills'
      ],
      jobs: [
        'Should search jobs with filters',
        'Should apply to job successfully',
        'Should get application status'
      ]
    },
    ui: {
      auth: [
        'Should display login form',
        'Should show validation errors',
        'Should redirect after login'
      ],
      resume: [
        'Should show upload button',
        'Should display parse results',
        'Should show skills analysis'
      ],
      jobs: [
        'Should render job search form',
        'Should display job listings',
        'Should show application status'
      ]
    }
  }
};

export default config; 
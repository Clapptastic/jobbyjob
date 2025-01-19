# AI Context Guide 🤖

## Application Overview

JobbyJob is an AI-powered job search assistant that leverages modern web technologies and artificial intelligence to automate and optimize the job search process. This document provides comprehensive context for AI assistants working with the codebase.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Components**: Custom components with Tailwind CSS
- **PWA Support**: Workbox + Vite PWA Plugin
- **Testing**: Vitest + Playwright

### Backend Architecture
- **Platform**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Functions**: Edge Functions
- **API Layer**: REST + GraphQL

### AI Integration
- **Primary LLM**: OpenAI GPT-4
- **Purpose**: Resume parsing, job matching, and application optimization
- **Integration Points**:
  - Resume analysis
  - Job description matching
  - Application customization
  - Interview preparation

## Core Features

### 1. Resume Management
```typescript
interface Resume {
  id: string;
  userId: string;
  content: string;
  parsedContent: {
    skills: string[];
    experience: Experience[];
    education: Education[];
  };
  version: number;
  createdAt: Date;
}
```

### 2. Job Search
```typescript
interface JobSearch {
  id: string;
  userId: string;
  criteria: {
    keywords: string[];
    location: string;
    type: JobType[];
    salary: SalaryRange;
  };
  results: Job[];
  matchScores: MatchScore[];
}
```

### 3. Application Tracking
```typescript
interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  customizedResume: string;
  coverLetter: string;
  timeline: ApplicationEvent[];
}
```

## Database Schema

### Key Tables
1. **profiles**
   - User information
   - Job preferences
   - Search history

2. **resumes**
   - Resume versions
   - Parsed content
   - AI analysis results

3. **jobs**
   - Job listings
   - Match scores
   - Application status

4. **applications**
   - Application tracking
   - Communication history
   - Status updates

## AI Integration Points

### 1. Resume Processing
```typescript
async function processResume(content: string): Promise<ParsedResume> {
  // AI analyzes resume content
  // Extracts skills, experience, education
  // Provides improvement suggestions
}
```

### 2. Job Matching
```typescript
async function matchJobToResume(
  job: Job,
  resume: Resume
): Promise<MatchResult> {
  // AI compares job requirements with resume
  // Generates match score and reasons
  // Suggests resume customizations
}
```

### 3. Application Optimization
```typescript
async function optimizeApplication(
  job: Job,
  resume: Resume
): Promise<OptimizedApplication> {
  // AI customizes resume for job
  // Generates cover letter
  // Provides application tips
}
```

## Development Patterns

### 1. Error Handling
```typescript
// Centralized error handling
const handleError = async (error: Error) => {
  logger.error(error);
  await errorReporting.send(error);
  showUserFriendlyError(error);
};
```

### 2. State Management
```typescript
// Zustand store pattern
interface AppState {
  user: User | null;
  jobs: Job[];
  applications: Application[];
  actions: {
    updateUser: (user: User) => void;
    addJob: (job: Job) => void;
    updateApplication: (app: Application) => void;
  };
}
```

### 3. API Integration
```typescript
// Supabase client pattern
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});
```

## Testing Strategy

### 1. Unit Tests
- Component testing
- Business logic validation
- AI integration mocking

### 2. Integration Tests
- API interactions
- Database operations
- State management

### 3. E2E Tests
- User flows
- Application processes
- System integration

## Deployment Architecture

### Development
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

### Production
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

## Security Considerations

### 1. Authentication
- Supabase JWT tokens
- Role-based access control
- Session management

### 2. Data Protection
- End-to-end encryption
- Secure credential storage
- API key management

### 3. API Security
- Rate limiting
- Request validation
- Error sanitization

## Performance Optimization

### 1. Caching Strategy
```typescript
// Service worker caching
registerRoute(
  ({ request }) => request.destination === 'style',
  new CacheFirst()
);
```

### 2. Code Splitting
```typescript
// Dynamic imports
const Dashboard = lazy(() => import('./components/Dashboard'));
```

### 3. Database Indexing
```sql
CREATE INDEX idx_jobs_match_score ON jobs (match_score);
CREATE INDEX idx_applications_status ON applications (status);
```

## AI Interaction Guidelines

### 1. Code Modifications
- Maintain TypeScript types
- Follow error handling patterns
- Update tests accordingly

### 2. Database Changes
- Check migration scripts
- Verify RLS policies
- Update schemas safely

### 3. AI Integration
- Respect rate limits
- Handle API errors
- Validate AI responses

## Support Resources

### Documentation
- [API Documentation](./API.md)
- [Database Schema](./SCHEMA.md)
- [Testing Guide](./TESTING.md)

### Tools
- GitHub repository
- Issue tracker
- CI/CD pipelines

### Monitoring
- Error tracking
- Performance metrics
- Usage analytics

## Version Control

### Current Version
- v1.0.0-pwa
- Tagged releases
- Semantic versioning

### Rollback Support
- Version tags
- Database migrations
- Configuration management
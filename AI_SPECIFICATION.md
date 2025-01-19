# AI Development Specification

## Application Overview
- Name: ClappCode
- Type: Job Application Automation System
- Tagline: "Sail right in"
- Stack: React + TypeScript + Supabase + OpenAI

## AI Assistant Compatibility
This specification is designed for:
- GitHub Copilot
- OpenAI ChatGPT
- Anthropic Claude
- Google Bard/Gemini
- Amazon CodeWhisperer
- Microsoft Copilot
- Tabnine
- Codeium

## Core Features
1. Resume Management
   - AI-powered resume parsing
   - Resume optimization
   - File storage (PDF, DOC, DOCX)
   - Version tracking

2. Job Matching
   - Automated job scraping
   - AI-based match scoring
   - Customizable search criteria
   - Multi-source aggregation

3. Application Automation
   - Cover letter generation
   - Resume tailoring
   - One-click applications
   - Follow-up scheduling

4. Analytics Dashboard
   - Application tracking
   - Success metrics
   - Response analytics
   - Match score trends

## Email Integration
1. Provider Support
   - SendGrid (recommended)
   - Mandrill (alternative)

2. Email Types
   - Access request notifications
   - Application confirmations
   - Follow-up reminders
   - Status updates

3. Template Management
   - Dynamic content
   - Responsive design
   - Custom variables
   - A/B testing

## Technical Requirements

### Frontend
```typescript
// Required dependencies
{
  "react": "^18.2.0",
  "typescript": "^5.2.2",
  "tailwindcss": "^3.3.5",
  "lucide-react": "^0.292.0",
  "@tanstack/react-query": "^5.8.4",
  "react-router-dom": "^6.20.0",
  "zustand": "^4.4.6"
}
```

### Backend (Supabase)
- PostgreSQL database
- Row Level Security (RLS)
- Edge Functions
- Storage buckets
- Real-time subscriptions

### AI Integration
- OpenAI GPT-4 API
- Function calling
- Streaming responses
- Error handling

## Database Schema

### Tables
1. profiles
   - id: uuid (PK)
   - email: text
   - resume_url: text
   - resume_content: jsonb
   - job_preferences: jsonb

2. jobs
   - id: uuid (PK)
   - user_id: uuid (FK)
   - title: text
   - company: text
   - match_score: real

3. applications
   - id: uuid (PK)
   - user_id: uuid (FK)
   - job_id: uuid (FK)
   - status: text
   - applied_at: timestamptz

## Edge Functions

### Required Functions
1. parse-resume
   - Input: Resume text/file
   - Output: Structured data
   - Model: GPT-4

2. generate-cover-letter
   - Input: Resume + Job
   - Output: Cover letter
   - Model: GPT-4

3. calculate-job-match
   - Input: Resume + Job
   - Output: Match score
   - Model: GPT-4

## Style Guide

### Theme Colors
```css
:root {
  --color-neon-pink: #ff2d55;
  --color-neon-blue: #2e3cff;
  --color-neon-purple: #b829ea;
  --color-neon-cyan: #01fffe;
  --color-cyber-dark: #0b1021;
  --color-cyber-darker: #060810;
  --color-cyber-light: #2a2d3d;
}
```

### Typography
- Primary: 'Press Start 2P' (Logo)
- Body: System font stack
- Monospace: For code/technical content

## Component Guidelines

### Structure
```typescript
// Component template
import React from 'react';
import { useStore } from '../store/useStore';
import logger from '../lib/logger';

const log = logger('ComponentName');

interface Props {
  // Props interface
}

export default function ComponentName({ prop1, prop2 }: Props) {
  // Component logic
  return (
    // JSX with Tailwind classes
  );
}
```

### Error Handling
```typescript
try {
  // Operation
} catch (error: any) {
  log.error('Operation failed:', error);
  toast.error(error.message || 'Operation failed');
}
```

## Testing Requirements

### Unit Tests
- Components
- Utilities
- Store actions
- API calls

### Integration Tests
- User flows
- API integration
- Storage operations
- Edge function calls

## Security Requirements

### Authentication
- Email/password
- JWT tokens
- Session management
- Password reset flow

### Data Protection
- RLS policies
- Input validation
- XSS prevention
- CORS configuration

## Development Workflow

### Setup
```bash
npm install
npm run setup
npm run dev
```

### Database
```bash
npm run db:reset
npm run storage:setup
```

### Edge Functions
```bash
npm run functions:deploy
```

## AI Development Instructions

### For Code Generation
1. Follow component structure
2. Use provided theme colors
3. Implement error handling
4. Add logging
5. Follow TypeScript patterns

### For Code Modification
1. Maintain existing patterns
2. Update relevant tests
3. Preserve error handling
4. Keep logging consistent
5. Follow style guide

### For Bug Fixing
1. Check logs first
2. Verify database state
3. Test edge cases
4. Update tests
5. Document fixes

## Deployment Requirements

### Production
- Node.js 18+
- PostgreSQL 14+
- OpenAI API access
- SSL certificate
- Environment variables

### Development
- Node.js 18+
- npm 8+
- Git
- Supabase CLI
- Environment setup

## Monitoring Requirements

### Application Metrics
- Error rates
- Response times
- API usage
- Storage usage

### User Metrics
- Active users
- Application success rate
- Job match accuracy
- System usage

## Documentation Requirements

### Code
- JSDoc comments
- Type definitions
- Function descriptions
- Component props

### API
- Endpoint descriptions
- Request/response formats
- Error codes
- Examples

## Version Control

### Branch Strategy
- main: Production
- develop: Development
- feature/*: Features
- fix/*: Bug fixes

### Commit Messages
- feat: New features
- fix: Bug fixes
- docs: Documentation
- style: Formatting
- refactor: Code changes

## End of Specification
Last Updated: 2024-02-14
Version: 1.0.0
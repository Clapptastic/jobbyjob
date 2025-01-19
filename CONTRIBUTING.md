# Contributing Guide 🤝

## Getting Started

1. **Fork Repository**
```bash
git clone <your-fork-url>
cd job-application-automation
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Development Environment**
```bash
npm run setup
```

## Development Guidelines

### Code Style

- Use TypeScript
- Follow ESLint rules
- Use Prettier formatting
- Write JSDoc comments

### Component Structure

```typescript
// ComponentName.tsx
import React from 'react';
import { useStore } from '../store/useStore';

interface Props {
  // Props interface
}

export default function ComponentName({ prop1, prop2 }: Props) {
  // Component logic
  return (
    // JSX
  );
}
```

### Testing

1. **Run Tests**
```bash
npm run test
```

2. **Add New Tests**
- Unit tests for utilities
- Component tests
- Integration tests

### Edge Functions

1. **Create Function**
```bash
supabase functions new function-name
```

2. **Test Locally**
```bash
supabase functions serve function-name
```

3. **Deploy**
```bash
npm run functions:deploy
```

## Pull Request Process

1. **Create Branch**
```bash
git checkout -b feature/your-feature
```

2. **Make Changes**
- Write code
- Add tests
- Update docs

3. **Commit**
```bash
git commit -m "feat: add new feature"
```

4. **Push Changes**
```bash
git push origin feature/your-feature
```

5. **Open PR**
- Use PR template
- Add description
- Link issues

## Best Practices

### Components
- Keep components small
- Use TypeScript
- Add prop types
- Write tests

### State Management
- Use Zustand
- Keep stores focused
- Document state shape

### Edge Functions
- Handle errors
- Add logging
- Set timeouts
- Add validation

### Database
- Use migrations
- Add indexes
- Enable RLS
- Document schema

## Review Process

1. **Code Review**
- Follow checklist
- Address feedback
- Update tests

2. **Testing**
- Run test suite
- Check coverage
- Manual testing

3. **Documentation**
- Update README
- Add JSDoc
- Update guides

## Release Process

1. **Version Bump**
```bash
npm version patch|minor|major
```

2. **Create Tag**
```bash
git tag v1.0.0
```

3. **Deploy**
```bash
npm run deploy:prod
```

## Need Help?

- Check documentation
- Open issue
- Join Discord
- Ask maintainers
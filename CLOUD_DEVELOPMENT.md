# Cloud Development Guide 🚀

## Quick Start

### GitHub Codespaces

1. Click "Code" > "Create codespace" in GitHub
2. Wait for environment to build
3. Access the app at the forwarded port (usually 5173)

### Google Cloud Shell

1. Open Cloud Shell
2. Clone repository:
```bash
git clone <repository-url>
cd clappcode
```
3. Install dependencies:
```bash
npm install
```
4. Start development server:
```bash
npm run dev
```

## Environment Setup

1. Copy `.env.example`:
```bash
cp .env.example .env
```

2. Configure environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `VITE_OPENAI_API_KEY`: Your OpenAI API key

## Development Features

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript
- GitHub Copilot

### Debugging
- Chrome debugger configured
- Test debugging support
- Source maps enabled

### Database Management
1. Open Supabase Studio
2. Run SQL from `setup.sql`
3. Verify tables and policies

### Edge Functions
1. Deploy from Supabase Dashboard
2. Copy function code from `supabase/functions/`
3. Set environment variables

## Common Tasks

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

### Database Reset
```bash
npm run db:reset
```

## Troubleshooting

### Port Already in Use
```bash
kill -9 $(lsof -t -i:5173)
npm run dev
```

### Database Connection Issues
1. Check `.env` variables
2. Verify Supabase project status
3. Test connection:
```bash
npm run db:verify
```

### Edge Function Errors
1. Check function logs in Supabase Dashboard
2. Verify environment variables
3. Test locally:
```bash
npm run functions:serve
```

## Best Practices

1. **Version Control**
   - Create feature branches
   - Write clear commit messages
   - Keep PRs focused

2. **Code Style**
   - Follow ESLint rules
   - Use TypeScript types
   - Document complex logic

3. **Testing**
   - Write unit tests
   - Test edge cases
   - Verify UI changes

4. **Security**
   - Never commit secrets
   - Use environment variables
   - Follow RLS policies

## Deployment

### Production
```bash
npm run deploy:prod
```

### Staging
```bash
npm run deploy:stage
```

## Support

- Check [Issues](https://github.com/your-repo/issues)
- Join Discord community
- Review documentation
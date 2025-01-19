# Getting Started Guide 🚀

## Initial Setup

1. **Connect to Supabase**
   - Launch the application
   - Click "Connect to Supabase" button
   - Follow the prompts to enter your:
     - Project URL
     - Anon/Public key
     - Service Role key
   - The database will be automatically configured

2. **Configure Secrets**
   - Required secrets:
     - Supabase URL & Keys
     - OpenAI API Key
     - GitHub Token

3. **Initialize Database**
```bash
npm run db:reset
npm run storage:setup
```

4. **Deploy Edge Functions**
```bash
npm run functions:deploy
```

## Development Workflow

1. **Start Development Server**
```bash
npm run dev
```

2. **Access the Application**
- Open `http://localhost:5173`
- Login or create account
- Upload resume to get started

3. **Key Features**

   a. **Resume Management**
   - Upload resume
   - AI parsing
   - Optimization suggestions

   b. **Job Search**
   - Set preferences
   - Automated scraping
   - Match scoring

   c. **Applications**
   - One-click apply
   - Cover letter generation
   - Application tracking

## Common Tasks

### Adding Resume
1. Click "Upload Resume"
2. Select PDF/DOC file
3. Wait for AI parsing
4. Review parsed data

### Setting Job Preferences
1. Open Job Preferences
2. Add keywords
3. Set location/remote
4. Save preferences

### Starting Job Search
1. Configure preferences
2. Click "Sync Jobs"
3. Review matches
4. Enable auto-apply

## Troubleshooting

### Database Connection
```bash
npm run db:verify
```

### Storage Issues
```bash
npm run storage:check
```

### Edge Functions
```bash
npm run functions:check
```

## Next Steps

1. Upload your resume
2. Set job preferences
3. Configure automation
4. Monitor dashboard
5. Review applications

## Additional Resources

- [Full Documentation](README.md)
- [API Reference](API.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guide](CONTRIBUTING.md)
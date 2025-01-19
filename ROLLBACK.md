# Rollback Guide 🔄

This guide provides instructions for rolling back to previous versions of the application.

## Available Versions

### v1.0.0-pwa
- PWA support
- Improved Supabase integration
- Enhanced error handling
- Updated documentation

## Rollback Methods

### 1. View Tagged Version
```bash
# View the specific version
git checkout v1.0.0-pwa

# Create a new branch if needed
git checkout -b feature-branch
```

### 2. Create New Branch from Version
```bash
# Create and switch to new branch
git checkout -b rollback-branch v1.0.0-pwa

# Push branch to remote
git push origin rollback-branch
```

### 3. Reset Main Branch
```bash
# Hard reset to version (warning: destructive)
git reset --hard v1.0.0-pwa

# Force push to remote (warning: destructive)
git push origin main --force
```

### 4. Revert While Keeping History
```bash
# Revert changes while maintaining history
git revert --no-commit HEAD..v1.0.0-pwa
git commit -m "Reverted to v1.0.0-pwa"
git push origin main
```

## Docker Rollback

### Development
```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Checkout version
git checkout v1.0.0-pwa

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build
```

### Production
```bash
# Stop containers
docker-compose -f docker-compose.prod.yml down

# Checkout version
git checkout v1.0.0-pwa

# Rebuild and start
docker-compose -f docker-compose.prod.yml up --build
```

## Database Rollback

### Supabase Changes
1. Check the version's schema in `supabase/migrations`
2. Use Supabase Dashboard to restore database
3. Or use CLI:
```bash
supabase db reset --db-version v1.0.0-pwa
```

## Post-Rollback Steps

1. **Verify Environment**
   ```bash
   # Install dependencies for version
   npm install
   
   # Check health
   npm run verify
   ```

2. **Update Configuration**
   - Review .env file
   - Check API keys
   - Verify Supabase settings

3. **Test Application**
   ```bash
   # Run tests
   npm test
   
   # E2E tests
   npm run test:e2e
   ```

## Troubleshooting

### Common Issues

1. **Dependency Conflicts**
   ```bash
   # Clear dependencies
   rm -rf node_modules
   npm install
   ```

2. **Docker Issues**
   ```bash
   # Clean Docker state
   docker-compose down -v
   docker system prune
   ```

3. **Database Issues**
   - Check Supabase connection
   - Verify migrations
   - Review data integrity

## Support

If you encounter any issues during rollback:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review [GitHub Issues](https://github.com/your-username/jobbyjob/issues)
3. Contact support team 
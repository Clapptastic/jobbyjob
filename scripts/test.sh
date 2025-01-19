#!/bin/bash

# Run unit tests
echo "Running unit tests..."
docker-compose -f docker-compose.dev.yml run --rm test npm run test

# Run E2E tests
echo "Running E2E tests..."
docker-compose -f docker-compose.dev.yml run --rm cypress run

# Check test results
if [ $? -eq 0 ]; then
    echo "All tests passed successfully!"
    exit 0
else
    echo "Tests failed!"
    exit 1
fi
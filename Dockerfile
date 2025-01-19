FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright dependencies
RUN npx playwright install-deps chromium

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Create .env file if it doesn't exist
RUN touch .env

# Set environment variables with defaults
ENV NODE_ENV=development \
    VITE_DEV_MODE=true \
    VITE_DOCKER=true

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
# Docker and CI/CD Conceptual Outline

This document outlines the conceptual setup for Docker (for containerizing the backend and frontend applications) and a CI/CD pipeline using GitHub Actions.

## 1. Conceptual Dockerfile for Backend (Node.js/Express.js)

**File Path:** `backend/Dockerfile` (This file is created as a placeholder)

**Purpose:** To containerize the Node.js/Express.js backend application.

```dockerfile
# Stage 1: Build/Install Dependencies
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# For production, it's often recommended to use 'npm ci' which uses package-lock.json
# and can be faster and more reliable for CI/CD builds.
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY . .

# Stage 2: Production Image (if not using a build step like TypeScript)
# If using TypeScript or a build step, this stage would copy from a 'build' stage.
# For a simple JS backend, we can often use the builder stage directly or optimize further.

FROM node:18-alpine
WORKDIR /usr/src/app

# Copy dependencies from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Copy application code
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/app.js ./app.js
# Ensure package.json is also copied if scripts from it are used by PM2 or similar
COPY --from=builder /usr/src/app/package.json ./package.json


# Expose the port the app runs on (should match .env or config)
EXPOSE 3001

# Command to run the application
# Using "npm start" which should be defined in package.json (e.g., "start": "node app.js")
# For production, consider using a process manager like PM2.
CMD [ "npm", "start" ]
```

**Notes:**
*   **Multi-stage Builds:** The example above hints at a multi-stage build. For a backend that requires a compilation step (e.g., TypeScript to JavaScript), a `builder` stage would compile the code, and a final leaner stage would copy only the compiled code and `node_modules`. Our current Node.js setup is direct JavaScript, so the benefit is mainly cleaner separation.
*   **`npm ci --only=production`**: This is good for installing only production dependencies.
*   **`.dockerignore`**: A `.dockerignore` file should be present in `backend/` to exclude `node_modules`, `.git`, `.env`, etc., from being copied into the image.

## 2. Conceptual Dockerfile for Frontend (Next.js)

**File Path:** `frontend/Dockerfile` (This file is created as a placeholder)

**Purpose:** To containerize the Next.js frontend application.

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Set NEXT_TELEMETRY_DISABLED to avoid issues during build in some environments
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /usr/src/app

# Set NEXT_TELEMETRY_DISABLED for the runtime environment as well
ENV NEXT_TELEMETRY_DISABLED 1

# Copy built assets from the builder stage
# Using Next.js's output standalone feature for optimized images
# This requires `output: 'standalone'` in `next.config.js`
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static
COPY --from=builder /usr/src/app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

# Define the command to run the production server
# This will use the .next/standalone/server.js file.
CMD ["node", "server.js"]
```

**Notes:**
*   **`output: 'standalone'`**: For this Dockerfile to be most effective, `output: 'standalone'` should be added to `frontend/next.config.js`. This feature dramatically reduces image size by copying only necessary files and `node_modules` into the `.next/standalone` directory.
*   **`.dockerignore`**: A `.dockerignore` file in `frontend/` should exclude `node_modules`, `.git`, `.next` (before build), etc.

## 3. Conceptual `docker-compose.yml` for Local Development

**File Path:** `docker-compose.yml` (This file is created as a placeholder at the repo root)

**Purpose:** To define and run multi-container Docker applications for local development.

```yaml
version: '3.8' # Specify docker-compose version

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile # Explicitly state Dockerfile if not named Dockerfile
    ports:
      - "3001:3001" # Map host port 3001 to container port 3001
    volumes:
      - ./backend:/usr/src/app # Mount backend source for live reload
      - /usr/src/app/node_modules # Anonymous volume to prevent host node_modules from overwriting container's
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://app_user:app_password@db:5432/app_db
      - JWT_SECRET=your_local_jwt_secret
      # Add other necessary backend environment variables
    depends_on:
      - db # Ensure db starts before backend
    command: npm run dev # Assuming a dev script in package.json that uses nodemon

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/usr/src/app
      - /usr/src/app/node_modules
      - /usr/src/app/.next # Persist .next folder if needed, or let it rebuild
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api # URL for the backend
      # NEXT_PUBLIC_ prefixed vars are exposed to the browser
    depends_on:
      - backend # Usually frontend depends on backend for API calls

  db:
    image: postgres:15-alpine # Use official PostgreSQL image
    ports:
      - "5432:5432" # Map host port 5432 to container port 5432
    environment:
      - POSTGRES_USER=app_user
      - POSTGRES_PASSWORD=app_password
      - POSTGRES_DB=app_db
    volumes:
      - pg_data:/var/lib/postgresql/data # Persist PostgreSQL data

volumes:
  pg_data: # Define a named volume for database persistence
```

## 4. Conceptual CI/CD Pipeline with GitHub Actions

**File Path:** `.github/workflows/main.yml` (This file is created as a placeholder)

**Purpose:** To automate linting, testing, building, and pushing Docker images, with a placeholder for deployment.

```yaml
name: Main CI/CD Pipeline

on:
  push:
    branches: [ main ] # Trigger on pushes to the main branch
  pull_request:
    branches: [ main ] # Trigger on pull requests targeting the main branch

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18' # Use the same Node.js version as in Dockerfiles
          cache: 'npm' # Cache npm dependencies

      - name: Install Backend Dependencies
        run: cd backend && npm ci
      - name: Run Backend Linter (e.g., ESLint)
        run: cd backend && npm run lint # Assuming a lint script in package.json

      - name: Install Frontend Dependencies
        run: cd frontend && npm ci
      - name: Run Frontend Linter (e.g., ESLint)
        run: cd frontend && npm run lint # Assuming a lint script

  test:
    runs-on: ubuntu-latest
    needs: lint # Run after lint job
    strategy:
      matrix:
        node-version: [18] # Define Node.js versions to test with
    services: # Spin up a PostgreSQL service for backend tests
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install Backend Dependencies
        run: cd backend && npm ci
      - name: Run Backend Tests
        run: cd backend && npm test # Assuming a test script
        env: # Set environment variables for backend tests
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
          NODE_ENV: test
          JWT_SECRET: test_secret

      - name: Install Frontend Dependencies
        run: cd frontend && npm ci
      - name: Run Frontend Tests
        run: cd frontend && npm test # Assuming a test script
        env:
          NEXT_PUBLIC_API_URL: http://localhost:8080/api # Mock API or use a test server

  build_and_push_images:
    runs-on: ubuntu-latest
    needs: test # Run after test job
    if: github.ref == 'refs/heads/main' && github.event_name == 'push' # Only run on push to main
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Log in to GitHub Container Registry (or Docker Hub)
        uses: docker/login-action@v2
        with:
          registry: ghcr.io # For GitHub Container Registry
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }} # GITHUB_TOKEN is automatically available
          # For Docker Hub, use secrets.DOCKERHUB_USERNAME and secrets.DOCKERHUB_TOKEN

      - name: Build and push Backend image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/invoicing-app-backend:${{ github.sha }} # Example tag

      - name: Build and push Frontend image
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/invoicing-app-frontend:${{ github.sha }}

  deploy:
    runs-on: ubuntu-latest
    needs: build_and_push_images # Run after images are built and pushed
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production # Optional: if using GitHub environments for secrets
    steps:
      - name: Placeholder for Deployment
        run: |
          echo "Deploying images for commit ${{ github.sha }}..."
          echo "Backend Image: ghcr.io/${{ github.repository_owner }}/invoicing-app-backend:${{ github.sha }}"
          echo "Frontend Image: ghcr.io/${{ github.repository_owner }}/invoicing-app-frontend:${{ github.sha }}"
          # Actual deployment steps would go here:
          # - SSH to server and run docker-compose pull && docker-compose up -d
          # - kubectl apply -f kubernetes-manifests/
          # - Deploy to Vercel/Netlify for frontend, Heroku/AWS EB for backend, etc.
```

**Notes on CI/CD:**
*   **Secrets:** `secrets.GITHUB_TOKEN` is available by default for pushing to GHCR within the same repository. For Docker Hub or other registries, you'd need to configure secrets in GitHub repository settings.
*   **Testing:** The test job includes a service container for PostgreSQL. Backend tests would need to connect to this. Frontend tests might need a mock API.
*   **Deployment:** The `deploy` job is highly conceptual and depends heavily on the chosen hosting platform and deployment strategy.
*   **Caching:** GitHub Actions offers caching for dependencies (e.g., `npm` modules) which can speed up workflows. `actions/setup-node` has built-in caching support.

This document provides a conceptual framework. Specific implementations will require adjustments based on actual code, configurations, and chosen hosting/deployment solutions.

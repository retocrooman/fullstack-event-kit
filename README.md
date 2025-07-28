# Fullstack Event Kit

A comprehensive fullstack TypeScript monorepo template enhanced with modern event-driven architecture, authentication, and data visualization capabilities.

## Overview

This project extends the [monorepo-ts-template](https://github.com/retocrooman/monorepo-ts-template) with three key enhancements:

- **Event-Driven Architecture** with CQRS patterns and NATS messaging for scalable microservices
- **Modern Authentication** with Auth0 for enterprise-grade user management and security
- **Data Visualization** with Tremor for building beautiful, responsive dashboards and analytics

## Enhanced Technology Stack

### Current Architecture

- **API Server (Port 8080)** - NestJS backend with Auth0 JWT validation and user management
- **Web App (Port 3000)** - Next.js frontend with Auth0 authentication and Tremor components
- **NATS Server (Port 4222)** - Message broker for event-driven communication
- **Database (PostgreSQL)** - Primary data store with Prisma ORM

### Backend Technologies

- **NestJS 11.x** - Scalable Node.js framework
- **PostgreSQL + Prisma** - Type-safe database operations
- **Auth0** - Enterprise authentication and authorization
- **NATS** - High-performance messaging system with JetStream persistence
- **Event Sourcing** - Transactional outbox pattern for reliable event publishing
- **Global Exception Handling** - Centralized error management
- **Repository Pattern** - Clean data access layer

### Frontend Technologies

- **Next.js 15.x** - React framework with App Router
- **Auth0 Next.js SDK** - Client-side authentication with protected routes
- **Radix UI** - Unstyled, accessible UI components
- **Tremor** - Beautiful, responsive data visualization components
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Query** - Server state management

## Key Features

### Current Implementation

- **Auth0 Authentication** - Enterprise-grade user authentication and authorization
- **User Management** - Complete CRUD operations with Auth0 integration
- **Event-Driven Architecture** - CQRS with transactional outbox pattern
- **NATS Messaging** - Reliable event publishing and consumption
- **Global Exception Handling** - Consistent error responses
- **Repository Pattern** - Clean separation of data access
- **Health Checks** - Application and database health monitoring
- **Type Safety** - Full TypeScript coverage with strict mode

### Architecture Patterns

- **Repository Pattern** - Abstracted data access layer
- **Dependency Injection** - NestJS IoC container
- **DTO Validation** - Input validation with class-validator
- **Entity Mapping** - Clean separation between domain and API models

### Planned Features

- **Data Visualization** - Interactive dashboards with Tremor
- **Advanced Event Sourcing** - Extended event replay and projection capabilities
- **Multi-tenant Architecture** - Support for multiple organizations

## Quick Start

### Auth0 Setup (Required)

1. **Create Auth0 Application**
   - Go to [Auth0 Dashboard](https://manage.auth0.com/)
   - Create a new "Single Page Application"
   - Note your Domain, Client ID, and Client Secret

2. **Configure Auth0 Application**
   - Set Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Set Allowed Logout URLs: `http://localhost:3000`
   - Set Allowed Web Origins: `http://localhost:3000`

3. **Create Auth0 API**
   - Create a new API in Auth0 Dashboard
   - Set Identifier (Audience): `https://your-api-identifier`
   - Note the API Identifier for configuration

## Project Setup

### Prerequisites

- Node.js 23.6.0+
- pnpm 10.3.0+
- Docker & Docker Compose

### Environment Configuration

1. **Copy environment template**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure Auth0 variables in .env.local**
   ```env
   AUTH0_SECRET=your-long-random-secret-key-for-session-encryption-minimum-32-characters
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_AUDIENCE=https://your-api-identifier
   ```

### Complete Setup

```bash
# Run complete project setup
pnpm setup

# This will:
# 1. Install all dependencies
# 2. Build all packages
# 3. Start PostgreSQL and NATS containers
# 4. Push database schema
# 5. Configure git hooks
```

### Development

```bash
# Start API server (port 8080)
pnpm api start:dev

# Start web application (port 3000)
pnpm web dev

# Verify servers are running
curl http://localhost:8080/health-check
curl http://localhost:3000
```

## API Endpoints

### Health Checks

- `GET /health-check` - Application health status
- `GET /health-check/db` - Database connectivity status

### Authentication (Auth0)

- `GET /api/auth/login` - Initiate Auth0 login
- `GET /api/auth/logout` - Auth0 logout
- `GET /api/auth/callback` - Auth0 callback handler

### User Management (Protected)

- `GET /users` - Get all users (public for testing)
- `GET /users/me` - Get current user profile (requires Auth0 token)
- `PUT /users/me` - Update current user profile (requires Auth0 token)
- `GET /users/:id` - Get user by ID (public for testing)
- `PUT /users/:id` - Update user (public for testing)

### Event System

- **NATS Messaging** - Event publishing and consumption via NATS
- **Outbox Pattern** - Reliable event delivery with transactional guarantees

## Environment Configuration

### Complete Environment Variables (.env.local)

```env
# Auth0 Configuration (Required)
AUTH0_SECRET=your-long-random-secret-key-for-session-encryption-minimum-32-characters
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_SCOPE=openid profile email

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5433/api_db?schema=public

# API Server Configuration
API_PORT=8080
API_BASE_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:3000

# NATS Configuration
NATS_HOST=localhost
NATS_PORT=4222

# Event Processing
OUTBOX_PROCESSING_INTERVAL_MS=5000
OUTBOX_CLEANUP_INTERVAL_MS=3600000
OUTBOX_RETENTION_DAYS=7
```

## Testing

### API Server Tests

```bash
# Run all tests
pnpm api test

# Run E2E tests
pnpm api test:e2e

# Run with coverage
pnpm api test:cov

# Watch mode
pnpm api test:watch
```

### Manual Testing

Use REST Client files for manual API testing:

- `rest-client/health.http` - Health check endpoints
- `rest-client/users.http` - User management endpoints
- `rest-client/api.http` - General API testing

### Test Database

Tests use isolated database environment configured in `apps/api/src/test-setup.ts`.

## Architecture Decisions

### Why NestJS?

- **Scalability** - Enterprise-grade framework with dependency injection
- **TypeScript First** - Built with TypeScript for type safety
- **Modular Architecture** - Clean separation of concerns
- **Decorator Support** - Clean validation and documentation

### Why Repository Pattern?

- **Testability** - Easy mocking and unit testing
- **Abstraction** - Clean separation between business logic and data access
- **Flexibility** - Easy to switch database implementations
- **Type Safety** - Strongly typed interfaces

### Why Auth0?

- **Enterprise Security** - Industry-leading authentication and authorization
- **Zero Maintenance** - Fully managed service with automatic updates
- **Scalable** - Handles millions of users without infrastructure concerns
- **Rich Ecosystem** - Extensive integrations and advanced features
- **Compliance Ready** - SOC2, GDPR, HIPAA compliant out of the box

## Project Structure

```
fullstack-event-kit/
├── apps/
│   ├── api/                 # NestJS API server (port 8080)
│   │   ├── src/
│   │   │   ├── auth/       # Auth0 JWT validation
│   │   │   ├── users/      # User management with Auth0 integration
│   │   │   ├── infrastructure/ # Repository implementations
│   │   │   ├── shared/     # Exception handling & filters
│   │   │   └── config/     # Environment configuration
│   │   ├── test/           # E2E tests
│   │   └── prisma/         # Database schema
│   ├── auth/               # Legacy auth service (to be removed)
│   └── web/                # Next.js frontend (port 3000)
│       └── src/
│           ├── app/        # App Router with Auth0 protection
│           ├── features/   # Feature-based organization
│           └── lib/        # API client with Auth0 tokens
├── rest-client/            # HTTP request files
└── dockers/               # Docker configurations (PostgreSQL + NATS)
```

## Common Commands

```bash
# Development
pnpm setup                 # Complete project setup
pnpm api start:dev         # Start API server
pnpm web dev              # Start web application

# Testing
pnpm api test             # Run API tests
pnpm api test:e2e         # E2E tests
pnpm api test:cov         # Coverage report

# Database
pnpm api db:generate      # Generate Prisma client
pnpm api db:push          # Push schema changes

# Build & Quality
pnpm build                # Build all packages
pnpm api lint             # Lint API code
pnpm api format           # Format code
```

## Development Roadmap

See [TODO.md](TODO.md) for the complete development roadmap and implementation plan.

## License

This project is licensed under the terms specified in the [LICENSE.md](LICENSE.md) file.
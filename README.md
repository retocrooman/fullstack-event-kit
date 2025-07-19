# Fullstack Event Kit

A comprehensive fullstack TypeScript monorepo template enhanced with modern event-driven architecture, authentication, and data visualization capabilities.

## Overview

This project extends the [monorepo-ts-template](https://github.com/retocrooman/monorepo-ts-template) with three key enhancements:

- **Event-Driven Architecture** with node-sqrs for implementing CQRS (Command Query Responsibility Segregation) patterns
- **Modern Authentication** with better-auth for secure, flexible user management
- **Data Visualization** with Tremor for building beautiful, responsive dashboards and analytics

## Enhanced Technology Stack

### Current Architecture

- **API Server (Port 8080)** - Main business logic server with user management
- **Web App (Port 3000)** - Next.js frontend with Tremor components
- **Auth Integration** - better-auth integration (in development)

### Backend Technologies

- **NestJS 11.x** - Scalable Node.js framework
- **PostgreSQL + Prisma** - Type-safe database operations
- **better-auth** - Modern authentication library (planned)
- **node-sqrs** - Command Query Responsibility Segregation implementation (planned)
- **Global Exception Handling** - Centralized error management
- **Repository Pattern** - Clean data access layer

### Frontend Technologies

- **Next.js 15.x** - React framework with App Router
- **Radix UI** - Unstyled, accessible UI components
- **Tremor** - Beautiful, responsive data visualization components
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Query** - Server state management

## Key Features

### Current Implementation

- **User Management** - Complete CRUD operations with validation
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

- **Event-Driven Architecture** - CQRS pattern with node-sqrs
- **Modern Authentication** - better-auth integration
- **Data Visualization** - Interactive dashboards with Tremor
- **Event Sourcing** - Complete audit trail of system changes

## Quick Start

### Prerequisites

- Node.js 23.6.0+
- pnpm 10.3.0+
- Docker & Docker Compose

### Complete Setup

```bash
# Run complete project setup
pnpm setup

# This will:
# 1. Install all dependencies
# 2. Build all packages
# 3. Start PostgreSQL container
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

### User Management

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Planned Endpoints

- **Authentication** - `/auth/*` routes (better-auth integration)
- **Events** - `/events/*` routes (CQRS/Event Sourcing)
- **Dashboard** - `/analytics/*` routes (Tremor visualization)

## Environment Configuration

### API Server (.env)

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/fullstack_event_kit"

# better-auth (planned)
BETTER_AUTH_URL=http://localhost:8080
BETTER_AUTH_SECRET=your-secret-key-here

# Application
APP_NAME=fullstack-event-kit
```

### Web Application (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_HTTP_URL=http://localhost:8080
NEXT_PUBLIC_HOST=local

# better-auth (planned)
NEXT_PUBLIC_AUTH_URL=http://localhost:8080
```

### Development Database

```env
# PostgreSQL Container
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/fullstack_event_kit"
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

### Why better-auth?

- **Modern API** - Clean, intuitive authentication library
- **Framework Agnostic** - Works with any Node.js framework
- **TypeScript Support** - Full type safety
- **Extensible** - Easy to customize and extend

## Project Structure

```
fullstack-event-kit/
├── apps/
│   ├── api/                 # NestJS API server (port 8080)
│   │   ├── src/
│   │   │   ├── users/      # User management module
│   │   │   ├── infrastructure/ # Repository implementations
│   │   │   ├── shared/     # Exception handling & filters
│   │   │   └── config/     # Environment configuration
│   │   ├── test/           # E2E tests
│   │   └── prisma/         # Database schema
│   ├── auth/               # Authentication service (planned)
│   └── web/                # Next.js frontend (port 3000)
│       └── src/
│           ├── app/        # App Router pages
│           └── features/   # Feature-based organization
├── rest-client/            # HTTP request files
└── dockers/               # Docker configurations
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
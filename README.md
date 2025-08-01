# Fullstack Event Kit

A fullstack TypeScript monorepo template built with **Domain-Driven Design (DDD)**, **CQRS**, **Event Sourcing**, and Auth0 authentication.

## Features

- **Domain-Driven Design** - Clean separation with proper domain modeling
- **CQRS & Event Sourcing** - Command Query Responsibility Segregation with node-eventstore
- **Modular Architecture** - Feature-based modules with clear layer separation
- **Auth0 Authentication** - Enterprise-grade user management
- **Data Visualization** - Tremor components for dashboards

## Architecture

### Project Structure

```
apps/
├── api/                    # NestJS backend (port 8080)
│   └── src/modules/        # Feature modules (DDD)
└── web/                    # Next.js frontend (port 3000)
packages/                   # Shared packages
```

### Module Structure

```
src/modules/[feature]/
├── domain/                 # Entities, value objects, events
├── application/            # Use cases, CQRS (aggregates, projections)
├── infrastructure/         # Repositories, external providers
├── presentation/           # Controllers, DTOs, mappers
└── [feature].module.ts
```

## Technology Stack

### Backend
- **Framework**: NestJS 11.x with TypeScript 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth0 integration with JWT validation
- **CQRS & Event Sourcing**: node-eventstore library with MongoDB storage
- **Testing**: Jest with comprehensive test coverage

### Frontend
- **Framework**: Next.js 15.x with App Router
- **UI**: React 19.x with Radix UI components
- **Styling**: Tailwind CSS v4
- **Data Visualization**: Tremor components
- **Authentication**: Auth0 Next.js SDK integration

### Infrastructure
- **Package Manager**: pnpm 10.3.0
- **Build System**: Turborepo
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL (containerized)
- **Event Store**: MongoDB (containerized)
- **Message Bus**: NATS (containerized)

## Key Features

### Current Implementation

#### Account & Coin Management Module
- **CQRS Implementation**: Simplified commands and queries with integrated Zod validation
- **Event Sourcing**: Complete audit trail with events (AccountCreated, CoinsAdded, etc.)
- **Projections**: Real-time read model updates
- **Advanced API**: Search, pagination, statistics, and transfer operations
- **Streamlined Architecture**: Direct command/query classes without redundant DTOs

#### Authentication & Security
- Auth0 enterprise-grade authentication
- JWT token validation with global exception handling
- Role-based access control ready

## Quick Start

```bash
pnpm setup              # Complete project setup
pnpm api start:dev      # API server (http://localhost:8080)
pnpm web dev           # Web app (http://localhost:3000)
```

### Common Commands

```bash
# Development
pnpm api start:dev      # Start API in watch mode
pnpm web dev           # Start web app in dev mode

# Building
pnpm build             # Build all packages
pnpm api build         # Build API only
pnpm web build         # Build web only

# Testing
pnpm api test          # Run API tests
pnpm api test:e2e      # Run E2E tests
pnpm api test:cov      # Run tests with coverage

# Database
pnpm api db:generate   # Generate Prisma client
pnpm api db:push       # Push schema to database

# Code Quality
pnpm api lint          # Lint API code
pnpm web lint          # Lint web code
```

### Port Configuration

- **API Server**: http://localhost:8080
- **Web Application**: http://localhost:3000
- **Database (PostgreSQL)**: localhost:5433
- **Event Store (MongoDB)**: localhost:27017
- **Message Bus (NATS)**: localhost:4222 (client), localhost:8222 (monitoring)

## API Endpoints

### Account Endpoints
- `GET /accounts` - List accounts with pagination and filtering
- `GET /accounts/me` - Get current user's account
- `GET /accounts/:id` - Get account by ID
- `GET /accounts/:id/exists` - Check if account exists
- `PUT /accounts/:id` - Update account coins
- `POST /accounts/transfer` - Transfer coins between accounts
- `GET /accounts/search?q=term` - Search accounts
- `GET /accounts/stats` - Get account statistics
- `DELETE /accounts/:id` - Delete account

### Health Check Endpoints
- `GET /health-check` - General API health status
- `GET /health-check/database` - PostgreSQL database health
- `GET /health-check/eventstore` - MongoDB eventstore health
- `GET /health-check/all` - All services health status

All endpoints include request/response validation and consistent error handling.

## Architecture Benefits

- **Domain-Driven Design**: Clean business logic separation with proper domain modeling
- **CQRS & Event Sourcing**: Scalable read/write separation with complete audit trail
- **Streamlined CQRS**: Simplified implementation with integrated Zod validation
- **Modular Architecture**: Easy to test, maintain, and extend with clear boundaries
- **Type Safety**: Full TypeScript coverage with strict mode and shared schemas
- **No Documentation Overhead**: Clean API design without automated documentation burden

## Development Guidelines

1. **Follow DDD principles** and maintain clear layer separation
2. **Use proper value objects** for domain validation
3. **Implement comprehensive tests** for all use cases
4. **Follow consistent API design** patterns without documentation overhead
5. **Use TypeScript strict mode** conventions
6. **Update README.md** when adding new features or changing architecture

## License

MIT License
# TypeScript Monorepo Template

A modern TypeScript monorepo template using pnpm workspaces, Turbo, and shared configurations with full-stack implementation including database integration, API development, and containerization.

## Prerequisites

- Node.js >= 23.6.0
- pnpm >= 10.2.0
- Docker (for containerization and database)

## Quick Start

```bash
# Install dependencies and setup the project
pnpm install
pnpm run setup

# Start development servers
pnpm web dev    # Next.js frontend on http://localhost:3000
pnpm api start:dev    # NestJS API on http://localhost:8080
```

## Available Scripts

### Root Level Commands

```bash
# Setup and installation
pnpm run setup                    # Install dependencies, build packages, setup git hooks, and initialize database
pnpm run setup:db                 # Start PostgreSQL database with Docker Compose
pnpm run setup:api                # Initialize API database schema
pnpm install                      # Install all dependencies

# Build commands
pnpm run build                    # Build all packages and apps
pnpm run rebuild                  # Force rebuild all packages and apps

# App-specific commands
pnpm web <command>                # Run commands in the web app
pnpm api <command>                # Run commands in the api app

# Utility scripts
pnpm run remove-node-modules      # Remove node_modules from all packages
pnpm run reset-docker             # Reset all Docker containers
pnpm run kill-port <port>         # Kill process running on specified port

# Testing
pnpm run test:container <dockerfile> <env_file>  # Test Docker container build and run

# Git and release management
pnpm run git:push                 # Push changes with custom script
pnpm run git:log                  # Show formatted git log
pnpm run release:patch            # Create patch release
pnpm run release:minor            # Create minor release
pnpm run release:major            # Create major release
```

### Development Commands

```bash
# Web app (Next.js)
pnpm web dev                      # Start development server
pnpm web build                    # Build for production
pnpm web start                    # Start production server
pnpm web lint                     # Run ESLint

# API app (NestJS)
pnpm api start:dev                # Start development server with watch mode
pnpm api start:debug              # Start with debug mode
pnpm api build                    # Build for production
pnpm api start:prod               # Start production server
pnpm api test                     # Run unit tests
pnpm api test:e2e                 # Run end-to-end tests
pnpm api test:cov                 # Run tests with coverage
pnpm api lint                     # Run ESLint

# Database commands (API)
pnpm api db:generate              # Generate Prisma client
pnpm api db:push                  # Push schema changes to database
pnpm api db:force-push            # Force push schema changes (data loss possible)
```

## Project Structure

```
.
├── apps/                         # Applications
│   ├── api/                      # NestJS backend API
│   │   ├── src/                  # Source code
│   │   │   ├── users/            # User module (CRUD example)
│   │   │   │   ├── dto/          # Data Transfer Objects
│   │   │   │   ├── services/     # Business logic
│   │   │   │   ├── repositories/ # Data access layer
│   │   │   │   └── users.controller.ts
│   │   │   ├── app.controller.ts # Main controller
│   │   │   ├── app.module.ts     # Root module
│   │   │   ├── health.controller.ts # Health check endpoints
│   │   │   ├── prisma.service.ts # Database service
│   │   │   └── main.ts           # Application entry point
│   │   ├── prisma/               # Database schema and migrations
│   │   │   └── schema.prisma     # Prisma schema definition
│   │   ├── test/                 # E2E tests
│   │   ├── Dockerfile            # Production Docker image
│   │   ├── .env.example          # Environment variables template
│   │   ├── jest.config.ts        # Jest configuration
│   │   └── package.json          # API dependencies and scripts
│   └── web/                      # Next.js frontend application
│       ├── src/                  # Source code
│       │   └── app/              # App router pages
│       │       ├── layout.tsx    # Root layout
│       │       ├── page.tsx      # Home page
│       │       └── globals.css   # Global styles
│       ├── public/               # Static assets
│       ├── Dockerfile            # Production Docker image
│       ├── .env.example          # Environment variables template
│       └── package.json          # Web dependencies and scripts
├── packages/                     # Shared packages
│   ├── eslint-config/            # Shared ESLint configurations
│   │   ├── index.js              # Base ESLint config
│   │   ├── next.js               # Next.js specific config
│   │   ├── nest.js               # NestJS specific config
│   │   └── package.json          # ESLint dependencies
│   └── tsconfig/                 # Shared TypeScript configurations
│       ├── base.json             # Base TypeScript config
│       ├── next.json             # Next.js specific config
│       ├── nest.json             # NestJS specific config
│       ├── nest-build.json       # NestJS build config
│       └── package.json          # Package metadata
├── dockers/                      # Docker configurations
│   └── docker-compose.yaml       # PostgreSQL database setup
├── rest-client/                  # REST Client for API testing
│   ├── api.http                  # HTTP requests for testing API endpoints
│   ├── health.http               # Health check requests
│   └── README.md                 # REST Client documentation
├── scripts/                      # Utility scripts
│   ├── push.sh                   # Git push script
│   ├── release-tag.sh            # Release tagging script
│   ├── remove-node-modules.sh    # Cleanup script
│   ├── docker.test.sh            # Docker test script
│   └── reset-docker.sh           # Docker reset script
├── package.json                  # Root package configuration
├── pnpm-workspace.yaml           # pnpm workspace configuration
├── turbo.json                    # Turbo build configuration
├── .gitignore                    # Git ignore rules
├── .npmrc                        # npm configuration
├── .node-version                 # Node.js version specification
└── README.md                     # This file
```

## Technology Stack

### Frontend (Web App)

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework

### Backend (API App)

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type safety with functional programming approach
- **Prisma** - Modern database toolkit and ORM
- **PostgreSQL** - Relational database
- **Swagger** - API documentation
- **Jest** - Testing framework
- **class-validator** - Validation decorators
- **@nestjs/terminus** - Health checks
- **Functional Programming** - Immutable data structures and pure functions

### Development Tools

- **pnpm** - Fast, disk space efficient package manager
- **Turbo** - High-performance build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization

## Features

### API Features

- **CRUD Operations** - Complete User management with Create, Read, Update, Delete
- **Database Integration** - PostgreSQL with Prisma ORM
- **API Documentation** - Automatic Swagger/OpenAPI documentation
- **Health Checks** - Application and database health monitoring
- **Validation** - Request/response validation with class-validator
- **Error Handling** - Structured error responses
- **Testing** - Unit and E2E tests with Jest
- **Functional Programming** - Immutable data structures and pure functions for predictable code

### Functional Programming Architecture

The API implements a functional programming approach with the following principles:

- **Immutable Data Structures** - All entities are readonly interfaces with immutable properties
- **Pure Functions** - Business logic implemented as side-effect-free functions
- **JSON State Management** - State is managed as JSON objects for easy serialization
- **Functional Composition** - Complex operations built from simple, composable functions

#### Entity Design Pattern

```typescript
// Immutable User interface
interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly age: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Pure function collection
const UserEntity = {
  fromPrisma: (prismaUser: any): User => ({ ... }),
  update: (user: User, updateData: UpdateUserData): User => ({ ... }),
  hasEmailChanged: (user: User, newEmail: string): boolean => ...,
  toJSON: (user: User): Record<string, any> => ({ ... }),
  toString: (user: User): string => ...
} as const;
```

#### Benefits of Functional Approach

- **Predictability** - Same input always produces same output
- **Testability** - Pure functions are easy to unit test
- **Immutability** - Prevents accidental state mutations
- **Composability** - Functions can be easily combined and reused
- **Debugging** - Easier to trace data flow and identify issues

### Development Features

- **Hot Reload** - Development servers with automatic reload
- **Type Safety** - End-to-end TypeScript integration
- **Code Quality** - ESLint and Prettier configuration
- **Database Management** - Easy schema management with Prisma
- **Container Support** - Production-ready Docker images
- **Environment Management** - Environment variable templates

## API Endpoints

### Health Check

- `GET /health-check` - Basic health check
- `GET /health-check/db` - Database health check

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### API Documentation

- `GET /api` - Swagger UI documentation (when running in development)

## Environment Setup

### API Environment Variables

Create `apps/api/.env` based on `apps/api/.env.example`:

```env
HOST=local
DATABASE_URL=postgresql://user:password@localhost:5433/db?schema=public
```

### Web Environment Variables

Create `apps/web/.env` based on `apps/web/.env.example`:

```env
NEXT_PUBLIC_API_HTTP_URL=http://localhost:8080
NEXT_PUBLIC_HOST=local
```

## Database Setup

The template includes a complete PostgreSQL setup with Prisma:

1. **Start Database**: `pnpm run setup:db`
2. **Initialize Schema**: `pnpm run setup:api`
3. **Generate Client**: `pnpm api db:generate`
4. **Apply Changes**: `pnpm api db:push`

## Testing

### Unit Tests

```bash
pnpm api test                     # Run unit tests
pnpm api test:watch               # Run tests in watch mode
pnpm api test:cov                 # Run tests with coverage
```

### E2E Tests

```bash
pnpm api test:e2e                 # Run end-to-end tests
```

### Docker Container Tests

```bash
pnpm run api test:container
pnpm run web test:container
```

## Docker Support

The project includes production-ready Docker configurations:

### Development with Docker Compose

```bash
cd dockers
docker-compose up --build
```

### Production Docker Images

```bash
# Build API image
docker build -f apps/api/Dockerfile -t api-app .

# Build Web image
docker build -f apps/web/Dockerfile -t web-app .
```

## Branch Strategy

### Feature Branch Workflow

1. **Create a Feature Branch**: For each task, create a feature branch from main. Branch names should follow the format `feature/{title}`.
2. **Develop and Commit**: Make and commit changes within this branch.
3. **Update Before PR**: Before creating a pull request, merge the latest main into your feature branch if there are conflicts.
4. **Submit PR**: Create a pull request against main.
5. **Review and Merge**: After review, merge the PR into main.

## Commit Message Conventions

| Prefix   | Description                                                                   |
| -------- | ----------------------------------------------------------------------------- |
| feat     | A new feature is introduced or an existing feature is significantly altered   |
| fix      | A bug or issue in the existing code is corrected                              |
| docs     | Modifications or additions to documentation                                   |
| refactor | The code is restructured or cleaned up without changing its external behavior |
| test     | Addition, modification, or deletion of test cases                             |
| build    | Changes that affect the build system or external dependencies                 |
| ci       | Changes to CI (Continuous Integration) configuration files and scripts        |
| config   | Changes to configuration files that do not affect the code directly           |
| chore    | Routine tasks or updates that do not modify the application code directly     |
| remove   | Code or files are deleted                                                     |
| revert   | Reverses a previous commit or changes                                         |
| change   | Changes to the code that do not fit into any other category                   |

## Release Management

### Release Tagging Script

The `scripts/release-tag.sh` script automates the creation of version tags for individual applications in the monorepo. This script follows semantic versioning and creates tags with detailed release notes.

#### Usage

```bash
./scripts/release-tag.sh <app_name> <update_type> [stg]
```

#### Parameters

- `app_name`: The name of the application (e.g., `api`, `web`)
- `update_type`: The type of version update (`major`, `minor`, or `patch`)
- `stg` (optional): Use `stg` as the third argument to create staging tags

#### Examples

```bash
# Create a patch release for the API app
./scripts/release-tag.sh api patch

# Create a minor release for the web app
./scripts/release-tag.sh web minor

# Create a staging release for the API app
./scripts/release-tag.sh api patch stg
```

#### Tag Format

- **Production tags**: `{app}-v{version}` (e.g., `api-v1.2.3`)
- **Staging tags**: `stg-{app}-v{version}` (e.g., `stg-api-v1.2.3`)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the terms specified in the [LICENSE.md](LICENSE.md) file.

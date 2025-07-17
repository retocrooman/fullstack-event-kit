# Fullstack Event Kit

A comprehensive fullstack TypeScript monorepo template enhanced with modern event-driven architecture, authentication, and data visualization capabilities.

## Overview

This project extends the [monorepo-ts-template](https://github.com/retocrooman/monorepo-ts-template) with three key enhancements:

- **Event-Driven Architecture** with node-cqrs for implementing CQRS (Command Query Responsibility Segregation) patterns
- **Modern Authentication** with better-auth for secure, flexible user management
- **Data Visualization** with Tremor for building beautiful, responsive dashboards and analytics

## Enhanced Technology Stack

### Additional Backend Technologies

- **node-cqrs** - Command Query Responsibility Segregation implementation
- **better-auth** - Comprehensive authentication solution
- **Event Sourcing** - Complete audit trail of system changes

### Additional Frontend Technologies

- **Tremor** - Beautiful, responsive data visualization components
- **better-auth client** - Frontend authentication integration

## Key Features

### Event-Driven Architecture

- **CQRS Pattern** - Separate read and write models for optimal performance
- **Event Sourcing** - Complete history of all system changes
- **Domain Events** - Loosely coupled communication between services

### Authentication & Authorization

- **Multi-Provider Auth** - OAuth (Google, GitHub, etc.) and traditional login
- **Session Management** - Secure, scalable session handling
- **Role-Based Access** - Granular permission system

### Data Visualization

- **Interactive Dashboards** - Real-time data visualization with Tremor
- **Responsive Charts** - Mobile-friendly data presentation
- **Custom Analytics** - Tailored metrics and KPIs

## Quick Start

```bash
# Install dependencies and setup the project
pnpm install
pnpm run setup

# Start development servers
pnpm web dev    # Next.js frontend on http://localhost:3000
pnpm api start:dev    # NestJS API on http://localhost:8080
```

## Enhanced API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Users (CQRS)

- `GET /users` - Query all users
- `GET /users/:id` - Query user by ID
- `POST /users/commands/create` - Create user command
- `PUT /users/commands/update/:id` - Update user command
- `DELETE /users/commands/delete/:id` - Delete user command

### Events

- `GET /events` - Get domain events
- `GET /events/:aggregateId` - Get events for specific aggregate

## Environment Setup

### API Environment Variables

```env
HOST=local
DATABASE_URL=postgresql://user:password@localhost:5433/db?schema=public
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8080
```

### Web Environment Variables

```env
NEXT_PUBLIC_API_HTTP_URL=http://localhost:8080
NEXT_PUBLIC_HOST=local
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

## Development Roadmap

See [TODO.md](TODO.md) for the complete development roadmap and implementation plan.

## Base Template

For detailed information about the base monorepo architecture, build system, testing, and deployment, please refer to the original [monorepo-ts-template](https://github.com/retocrooman/monorepo-ts-template) documentation.

## License

This project is licensed under the terms specified in the [LICENSE.md](LICENSE.md) file.

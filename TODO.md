# TODO - Fullstack Event Kit Development Roadmap

This document outlines the development tasks needed to implement the enhanced features described in the README.md.

## ✅ Completed: Auth0 Integration

### Authentication Migration

- [x] **Auth0 Setup** - Migrated from Lucia to Auth0 for enterprise-grade authentication
- [x] **API Server Authentication** - JWT validation with Auth0 JWKS integration
- [x] **Frontend Authentication** - Auth0 Next.js SDK with protected routes
- [x] **User Management Integration** - Dynamic user creation from Auth0 identity
- [x] **Environment Configuration** - Updated all .env.example files for Auth0

### Event-Driven Architecture (Completed)

- [x] **NATS Integration** - Message broker for reliable event publishing
- [x] **Transactional Outbox Pattern** - Reliable event delivery with database guarantees
- [x] **User Registration Events** - Auth server publishes UserCreatedEvent via NATS
- [x] **Event Processing** - Background processor with retry logic and dead letter queue
- [x] **Docker Configuration** - NATS server with JetStream persistence

## Phase 1: Foundation Setup

### 1.1 Project Configuration

- [x] Update project name in package.json from "monorepo-ts-template" to "fullstack-event-kit"
- [ ] Add shared-types package for common TypeScript interfaces
- [x] Update environment variable templates with Auth0 configuration
- [ ] Configure Turbo build system for new packages

### 1.2 Dependencies Installation

- [ ] Install node-cqrs dependencies in API app (CQRS implementation pending)
- [x] Install Auth0 dependencies in both API and Web apps
- [ ] Install Tremor dependencies in Web app
- [x] Update package.json files with Auth0 dependencies

## Phase 2: Backend Implementation (API)

### 2.1 CQRS Infrastructure Setup

- [ ] Install and configure node-cqrs
  - [ ] Add `@node-cqrs/core` dependency
  - [ ] Add `@node-cqrs/eventstore` dependency
- [ ] Create shared CQRS infrastructure
  - [ ] `src/shared/cqrs/command-handler.base.ts`
  - [ ] `src/shared/cqrs/query-handler.base.ts`
  - [ ] `src/shared/cqrs/aggregate-root.base.ts`
  - [ ] `src/shared/cqrs/domain-event.base.ts`
- [ ] Create event store infrastructure
  - [ ] `src/shared/events/event-store.service.ts`
  - [ ] `src/shared/events/event-publisher.service.ts`
  - [ ] `src/shared/events/event-handler.base.ts`
- [ ] Create custom decorators
  - [ ] `src/shared/decorators/command-handler.decorator.ts`
  - [ ] `src/shared/decorators/query-handler.decorator.ts`
  - [ ] `src/shared/decorators/event-handler.decorator.ts`

### 2.2 Authentication Module (Auth0) ✅ COMPLETED

- [x] Install Auth0 backend dependencies
  - [x] Add `@nestjs/passport` dependency
  - [x] Add `passport-jwt` and `jwks-rsa` for JWT validation
- [x] Create Auth0 authentication module
  - [x] `src/auth/auth.module.ts`
  - [x] `src/auth/strategies/jwt.strategy.ts` - Auth0 JWKS integration
  - [x] `src/auth/guards/auth.guard.ts` - Global authentication guard
- [x] Configure Auth0 JWT validation
  - [x] JWKS endpoint integration for automatic key rotation
  - [x] Audience and issuer validation
  - [x] User claim extraction and mapping
- [x] Create authentication guards and decorators
  - [x] `src/auth/guards/auth.guard.ts` - Global auth guard with public route support
  - [x] `src/auth/decorators/user.decorator.ts` - Current user decorator
  - [x] `src/auth/decorators/public.decorator.ts` - Public route decorator

### 2.3 User Domain with CQRS

- [ ] Refactor existing user module to CQRS pattern
- [ ] Create user aggregate
  - [ ] `src/users/aggregates/user.aggregate.ts`
- [ ] Create user commands
  - [ ] `src/users/commands/create-user.command.ts`
  - [ ] `src/users/commands/update-user.command.ts`
  - [ ] `src/users/commands/delete-user.command.ts`
  - [ ] `src/users/commands/handlers/create-user.handler.ts`
  - [ ] `src/users/commands/handlers/update-user.handler.ts`
  - [ ] `src/users/commands/handlers/delete-user.handler.ts`
- [ ] Create user queries
  - [ ] `src/users/queries/get-user.query.ts`
  - [ ] `src/users/queries/get-users.query.ts`
  - [ ] `src/users/queries/handlers/get-user.handler.ts`
  - [ ] `src/users/queries/handlers/get-users.handler.ts`
- [ ] Create user events
  - [ ] `src/users/events/user-created.event.ts`
  - [ ] `src/users/events/user-updated.event.ts`
  - [ ] `src/users/events/user-deleted.event.ts`
  - [ ] `src/users/events/handlers/user-created.handler.ts`
  - [ ] `src/users/events/handlers/user-updated.handler.ts`
  - [ ] `src/users/events/handlers/user-deleted.handler.ts`

### 2.4 Database Schema Updates

- [ ] Update Prisma schema for authentication
  - [ ] Add User authentication fields
  - [ ] Add Session table
  - [ ] Add Account table for OAuth
  - [ ] Add Role and Permission tables
- [ ] Update Prisma schema for event sourcing
  - [ ] Add Event table for event store
  - [ ] Add Snapshot table for aggregate snapshots
- [ ] Generate and apply database migrations

### 2.5 API Endpoints

- [ ] Update user controller for CQRS endpoints
- [ ] Create authentication endpoints
- [ ] Create event endpoints for debugging/monitoring
- [ ] Update Swagger documentation

## Phase 3: Frontend Implementation (Web)

### 3.1 Authentication Setup (Auth0) ✅ COMPLETED

- [x] Install Auth0 client dependencies
  - [x] Add `@auth0/nextjs-auth0` dependency
- [x] Configure Auth0 client
  - [x] `src/lib/api-client.ts` - API client with Auth0 token integration
  - [x] `src/app/api/auth/[...auth0]/route.ts` - Auth0 API routes
- [x] Create Auth0 authentication components
  - [x] `src/features/auth/components/Auth0LoginButton.tsx` - Login/logout UI
  - [x] Auth0Provider integration in layout
- [x] Create authentication pages
  - [x] `src/app/login/page.tsx` - Auth0 login page
  - [x] `src/app/dashboard/page.tsx` - Protected dashboard with Auth0
  - [x] `src/app/profile/page.tsx` - User profile management
- [x] Implement Auth0 hooks and protection
  - [x] `useUser` hook from Auth0 SDK
  - [x] `withPageAuthRequired` for route protection

### 3.2 Data Visualization Setup (Tremor)

- [ ] Install Tremor dependencies
  - [ ] Add `@tremor/react` dependency
  - [ ] Configure Tremor with Tailwind CSS
- [ ] Create chart components
  - [ ] `src/components/charts/area-chart.tsx`
  - [ ] `src/components/charts/bar-chart.tsx`
  - [ ] `src/components/charts/line-chart.tsx`
  - [ ] `src/components/charts/donut-chart.tsx`
  - [ ] `src/components/charts/metric-card.tsx`
- [ ] Create dashboard components
  - [ ] `src/components/dashboard/dashboard-layout.tsx`
  - [ ] `src/components/dashboard/stats-overview.tsx`
  - [ ] `src/components/dashboard/user-analytics.tsx`
  - [ ] `src/components/dashboard/event-timeline.tsx`

### 3.3 Dashboard Implementation

- [ ] Create dashboard pages
  - [ ] `src/app/dashboard/page.tsx` - Main dashboard
  - [ ] `src/app/dashboard/users/page.tsx` - User management
  - [ ] `src/app/dashboard/analytics/page.tsx` - Analytics view
  - [ ] `src/app/dashboard/events/page.tsx` - Event monitoring
- [ ] Create dashboard layout
  - [ ] `src/app/dashboard/layout.tsx`
  - [ ] Navigation sidebar
  - [ ] Header with user menu
- [ ] Implement data fetching
  - [ ] API integration for dashboard data
  - [ ] Real-time updates with WebSocket/SSE
  - [ ] Data caching and optimization

### 3.4 UI Components

- [ ] Create reusable UI components
  - [ ] `src/components/ui/button.tsx`
  - [ ] `src/components/ui/input.tsx`
  - [ ] `src/components/ui/modal.tsx`
  - [ ] `src/components/ui/table.tsx`
  - [ ] `src/components/ui/loading.tsx`
- [ ] Create layout components
  - [ ] `src/components/layout/header.tsx`
  - [ ] `src/components/layout/sidebar.tsx`
  - [ ] `src/components/layout/footer.tsx`

## Phase 4: Integration & Testing

### 4.1 API Integration

- [ ] Connect frontend authentication with backend
- [ ] Implement API client with proper error handling
- [ ] Add request/response interceptors
- [ ] Implement retry logic and offline support

### 4.2 Testing Implementation

- [ ] Update API unit tests for CQRS pattern
- [ ] Add authentication tests
- [ ] Add event sourcing tests
- [ ] Update E2E tests for new endpoints
- [ ] Add frontend component tests
- [ ] Add integration tests for auth flow

### 4.3 Documentation Updates

- [ ] Update API documentation with new endpoints
- [ ] Add authentication flow documentation
- [ ] Add CQRS pattern documentation
- [ ] Update deployment documentation

## Phase 5: Advanced Features

### 5.1 Real-time Features

- [ ] Implement WebSocket support for real-time updates
- [ ] Add real-time dashboard updates
- [ ] Implement event streaming to frontend
- [ ] Add notification system

### 5.2 Performance Optimization

- [ ] Implement caching strategies
- [ ] Add database query optimization
- [ ] Implement lazy loading for dashboard components
- [ ] Add performance monitoring

### 5.3 Security Enhancements

- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Implement proper CORS configuration
- [ ] Add security headers
- [ ] Implement audit logging

### 5.4 Monitoring & Observability

- [ ] Add application logging
- [ ] Implement health checks for all services
- [ ] Add metrics collection
- [ ] Implement error tracking
- [ ] Add performance monitoring

### 5.5 Event-Driven Architecture with NATS ✅ COMPLETED

- [x] Implement NATS microservices communication
  - [x] Install `@nestjs/microservices` in auth server
  - [x] Install `nats` client library
  - [x] Configure NATS server with JetStream in Docker Compose
- [x] Create user registration event flow
  - [x] Auth server: Emit `UserCreatedEvent` when user is created
  - [x] Transactional outbox pattern for reliable event publishing
  - [x] Event patterns and message contracts defined
- [x] Implement event-driven architecture
  - [x] `src/auth/events/domain/user-created.event.ts` (Auth server)
  - [x] `src/auth/events/infrastructure/outbox.repository.ts` - Event persistence
  - [x] `src/auth/events/services/event-publisher.service.ts` - NATS publishing
  - [x] `src/auth/events/services/outbox-processor.service.ts` - Background processing
  - [x] Proper error handling, retry logic, and dead letter queue
  - [x] Idempotency and event ordering guarantees
- [x] Add NATS configuration
  - [x] Environment variables for NATS connection
  - [x] NATS health monitoring available at http://localhost:8222
  - [x] Graceful shutdown and connection management

## Phase 6: Production Readiness

### 6.1 Environment Configuration

- [ ] Update Docker configurations
- [ ] Add production environment variables
- [ ] Configure CI/CD pipeline
- [ ] Add deployment scripts

### 6.2 Documentation Finalization

- [ ] Complete API documentation
- [ ] Add deployment guide
- [ ] Create user manual
- [ ] Add troubleshooting guide

### 6.3 Quality Assurance

- [ ] Complete test coverage
- [ ] Performance testing
- [ ] Security audit
- [ ] User acceptance testing

## Dependencies to Add

### Backend (API) - Auth0 & Event-Driven

```json
{
  "dependencies": {
    "@nestjs/passport": "^10.0.3",
    "@nestjs/microservices": "^11.1.3",
    "passport-jwt": "^4.0.1",
    "jwks-rsa": "^3.1.0",
    "nats": "^2.28.2"
  }
}
```

### Frontend (Web) - Auth0

```json
{
  "dependencies": {
    "@auth0/nextjs-auth0": "^4.8.0",
    "@tremor/react": "^3.0.0" // Pending implementation
  }
}
```

### Legacy Auth Server

```json
{
  "dependencies": {
    "lucia": "^3.2.2", // To be removed
    "@lucia-auth/adapter-prisma": "^4.0.1" // To be removed
  }
}
```

### Shared Types Package

```json
{
  "name": "@repo/shared-types",
  "dependencies": {
    "typescript": "^5.7.3"
  }
}
```

## Notes

- Each phase should be completed and tested before moving to the next
- Regular commits should be made with descriptive commit messages
- Documentation should be updated as features are implemented
- Testing should be done continuously throughout development
- Security considerations should be addressed at each phase

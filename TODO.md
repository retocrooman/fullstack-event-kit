# TODO - Fullstack Event Kit Development Roadmap

This document outlines the development tasks needed to implement the enhanced features described in the README.md.

## Phase 1: Foundation Setup

### 1.1 Project Configuration

- [ ] Update project name in package.json from "monorepo-ts-template" to "fullstack-event-kit"
- [ ] Add shared-types package for common TypeScript interfaces
- [ ] Update environment variable templates with new authentication secrets
- [ ] Configure Turbo build system for new packages

### 1.2 Dependencies Installation

- [ ] Install node-cqrs dependencies in API app
- [ ] Install better-auth dependencies in both API and Web apps
- [ ] Install Tremor dependencies in Web app
- [ ] Update package.json files with new dependencies

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

### 2.2 Authentication Module (better-auth)

- [ ] Install better-auth backend dependencies
  - [ ] Add `better-auth` dependency
  - [ ] Add `better-auth/adapters/prisma` for database integration
- [ ] Create authentication module
  - [ ] `src/auth/auth.module.ts`
  - [ ] `src/auth/auth.controller.ts`
  - [ ] `src/auth/auth.service.ts`
  - [ ] `src/auth/auth.config.ts`
- [ ] Configure authentication providers
  - [ ] Email/password authentication
  - [ ] OAuth providers (Google, GitHub)
  - [ ] JWT token management
- [ ] Create authentication guards and decorators
  - [ ] `src/auth/guards/auth.guard.ts`
  - [ ] `src/auth/decorators/current-user.decorator.ts`
  - [ ] `src/auth/decorators/roles.decorator.ts`

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

### 3.1 Authentication Setup (better-auth)

- [ ] Install better-auth client dependencies
  - [ ] Add `better-auth/client` dependency
  - [ ] Add `better-auth/plugins` for additional features
- [ ] Configure authentication client
  - [ ] `src/lib/auth.ts` - better-auth configuration
  - [ ] `src/lib/api.ts` - API client with auth headers
- [ ] Create authentication components
  - [ ] `src/components/auth/login-form.tsx`
  - [ ] `src/components/auth/register-form.tsx`
  - [ ] `src/components/auth/logout-button.tsx`
  - [ ] `src/components/auth/auth-provider.tsx`
- [ ] Create authentication pages
  - [ ] `src/app/auth/login/page.tsx`
  - [ ] `src/app/auth/register/page.tsx`
  - [ ] `src/app/auth/callback/page.tsx`
- [ ] Create authentication hooks
  - [ ] `src/hooks/use-auth.ts`
  - [ ] `src/hooks/use-session.ts`

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

### Backend (API)

```json
{
  "dependencies": {
    "@node-cqrs/core": "^2.0.0",
    "@node-cqrs/eventstore": "^2.0.0",
    "better-auth": "^1.0.0",
    "better-auth/adapters/prisma": "^1.0.0"
  }
}
```

### Frontend (Web)

```json
{
  "dependencies": {
    "@tremor/react": "^3.0.0",
    "better-auth": "^1.0.0",
    "better-auth/client": "^1.0.0"
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

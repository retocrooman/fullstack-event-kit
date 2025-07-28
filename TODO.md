# Project TODO List

## 🚀 Next Tasks (2025-01-28)

### High Priority
- [ ] **Frontend Coin Transfer Interface Implementation**
  - [ ] Create coin balance display component
  - [ ] Implement coin transfer form (using `/accounts/transfer` API)
  - [ ] Build transfer history display feature
  - [ ] Integrate with Auth0 authentication
  - [ ] Connect API endpoints (`/accounts/me`, `/accounts/transfer`)
  - [ ] Add error handling and validation

### Medium Priority
- [ ] **BI Container Setup (Data Analytics & Visualization)**
  - [ ] Add BI environment to Docker Compose configuration
  - [ ] Setup Grafana/Metabase containers
  - [ ] Configure PostgreSQL connections
  - [ ] Configure MongoDB EventStore connections
  - [ ] Create account & coin statistics dashboard

- [ ] **UI Library Creation and Setup**
  - [ ] Create packages/ui package
  - [ ] Design common components (Button, Input, Card, etc.)
  - [ ] Setup Storybook
  - [ ] Establish Design System guidelines
  - [ ] Configure TailwindCSS integration

---

## ✅ Recently Completed (2025-01-28)

### API Documentation Cleanup
- [x] **Complete Swagger/OpenAPI Documentation Removal**
  - [x] Removed Swagger configuration from main.ts (DocumentBuilder, SwaggerModule)
  - [x] Removed all Swagger decorators from controllers
    - [x] account-command.controller.ts - Removed @ApiTags, @ApiOperation, etc.
    - [x] account-query.controller.ts - Removed all API decorators
    - [x] health.controller.ts - Removed health check API decorators
    - [x] app.controller.ts - Removed application API decorators
  - [x] Completely removed @nestjs/swagger package
  - [x] Verified tests, linting, and build all pass

### Documentation & Development Process Updates
- [x] **Complete README.md Overhaul**
  - [x] Removed non-existent user management module references
  - [x] Updated to match actual API endpoints
    - [x] `/accounts/me` - Get current user's account
    - [x] `/accounts/transfer` - Coin transfer API
    - [x] `/accounts/:id/exists` - Account existence check
  - [x] Added "No Documentation Overhead" as architecture benefit
  - [x] Added README update requirement to development guidelines

- [x] **Enhanced Claude Code Hooks**
  - [x] Added README update reminder functionality
  - [x] Implemented automatic checks for new features/API changes
  - [x] Added README update item to mandatory requirements list

### Previous Architecture Work
- [x] **CQRS Implementation Streamlining** (2025-01-27)
  - [x] Implemented Zod integrated validation
  - [x] Simplified command/query classes

- [x] **Claude Code Hooks Introduction** (2025-01-26)
  - [x] CLAUDE.md rule automatic checking functionality
  - [x] Made testing, linting, and building mandatory

- [x] **Event Sourcing Architecture** (2025-01-25)
  - [x] Migrated from node-cqrs to node-eventstore
  - [x] Integrated MongoDB EventStore

---

## 📋 Development Standards

### Mandatory Checklist for All Code Changes
1. ✅ **Testing**: `pnpm api test` (mandatory execution)
2. ✅ **Linting**: `pnpm api lint` (mandatory execution)
3. ✅ **Build**: `pnpm api build` (mandatory execution)
4. ✅ **Environment**: Use EnvConfig class (direct process.env usage prohibited)
5. ✅ **File Management**: Prefer editing existing files (minimize new file creation)
6. ✅ **Documentation**: Update README.md when adding new features

### Architecture Principles
- **Domain-Driven Design**: Clean business logic separation
- **CQRS & Event Sourcing**: Scalable read/write separation with MongoDB EventStore
- **Type Safety**: Full TypeScript strict mode coverage
- **No Documentation Overhead**: Clean API design without automated docs
- **Test-First**: Comprehensive test coverage for all use cases

---

*Last updated: 2025-01-28*
# Claude AI Development Guidelines for Fullstack Event Kit

This document provides comprehensive guidelines for Claude AI (or any AI assistant) when working on the fullstack-event-kit project. It covers project structure, conventions, workflows, and best practices to ensure consistent and high-quality contributions.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Development Workflow](#development-workflow)
5. [Code Style and Conventions](#code-style-and-conventions)
6. [Testing Requirements](#testing-requirements)
7. [Common Commands](#common-commands)
8. [Git Workflow](#git-workflow)
9. [Project-Specific Considerations](#project-specific-considerations)

## Project Overview

The Fullstack Event Kit is a modern TypeScript monorepo template enhanced with:

- **Event-Driven Architecture** using CQRS patterns and NATS messaging
- **Authentication** powered by Auth0 enterprise authentication
- **Data Visualization** with Tremor components
- **Infrastructure** using NestJS (API) and Next.js (Web)

This is a pnpm workspace monorepo using Turborepo for build orchestration.

## Project Structure

```
fullstack-event-kit/
├── apps/
│   ├── api/                 # NestJS backend application
│   │   ├── src/
│   │   │   ├── auth/       # Auth0 JWT validation module
│   │   │   ├── users/      # User management module
│   │   │   ├── infrastructure/  # Repository implementations
│   │   │   └── shared/     # Shared utilities and base classes
│   │   ├── test/           # E2E tests
│   │   └── prisma/         # Database schema and migrations
│   └── web/                # Next.js frontend application
│       └── src/
│           └── app/        # App Router pages
├── packages/               # Shared packages (future)
├── dockers/               # Docker configurations
├── rest-client/           # HTTP request files for API testing
├── scripts/               # Utility scripts
└── turbo.json            # Turborepo configuration
```

## Technology Stack

### Backend (API)

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: better-auth
- **Event Sourcing**: node-sqrs (planned)
- **Testing**: Jest with Prisma test environment
- **API Documentation**: Swagger/OpenAPI
- **Language**: TypeScript 5.x

### Frontend (Web)

- **Framework**: Next.js 15.x with App Router
- **UI**: React 19.x
- **Styling**: Tailwind CSS v4
- **Data Visualization**: Tremor (follow official documentation)
- **Language**: TypeScript 5.x

### Infrastructure

- **Package Manager**: pnpm 10.3.0
- **Node Version**: 23.6.0+
- **Build System**: Turborepo
- **Containerization**: Docker & Docker Compose
- **Linting**: ESLint 9.x
- **Formatting**: Prettier

## Development Workflow

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd fullstack-event-kit

# Run the complete setup
pnpm setup

# This will:
# 1. Install all dependencies
# 2. Build all packages
# 3. Configure git hooks
# 4. Start Docker containers (PostgreSQL)
# 5. Push database schema
```

### Daily Development

```bash
# Start the database
pnpm setup:db

# Start API in development mode (runs on port 8080)
pnpm api start:dev

# Start web app in development mode (runs on port 3000)
pnpm web dev

# IMPORTANT: Always verify servers are running with curl
curl -I http://localhost:8080/health  # Verify API server
curl -I http://localhost:3000         # Verify Web server

# If port 3000 is in use, Next.js will auto-increment to 3001, 3002, etc.
# Check the terminal output for the actual port and test accordingly:
curl -I http://localhost:3001         # If running on port 3001

# TROUBLESHOOTING: If servers show "Ready" but curl fails:
# 1. Check if processes are actually running in a NEW terminal:
ps aux | grep next
ps aux | grep node

# 2. Kill orphaned processes and restart:
pkill -f "next dev"
npx next dev --port 3000

# 3. Verify network binding (some systems bind to 127.0.0.1 only):
curl -I http://127.0.0.1:3000

# Run commands in specific workspaces
pnpm api <command>  # Run command in API workspace
pnpm web <command>  # Run command in Web workspace
```

### Port Configuration

- **API Server**: http://localhost:8080 (NestJS with Auth0 JWT validation)
- **Web Application**: http://localhost:3000 (Next.js with Auth0 authentication)
- **Database (PostgreSQL)**: localhost:5433 (API database)
- **NATS Message Bus**: localhost:4222 (client), localhost:8222 (monitoring)
- **Auth0**: External service for authentication and user management

## Code Style and Conventions

### TypeScript Guidelines

1. **Strict Mode**: Always use TypeScript strict mode
2. **Explicit Types**: Prefer explicit type annotations over inference for function parameters and return types
3. **Interfaces vs Types**: Use interfaces for object shapes, types for unions/intersections
4. **Naming Conventions**:
   - PascalCase: Classes, Interfaces, Types, Enums
   - camelCase: Variables, functions, methods
   - UPPER_SNAKE_CASE: Constants
   - kebab-case: File names

### NestJS Specific Conventions

1. **Module Structure**:

   ```
   feature/
   ├── dto/              # Data Transfer Objects
   ├── entities/         # Domain entities
   ├── interfaces/       # Repository interfaces
   ├── mappers/          # Entity-DTO mappers
   ├── services/         # Business logic
   ├── feature.controller.ts
   └── feature.module.ts
   ```

2. **Dependency Injection**: Always use constructor injection
3. **DTOs**: Use class-validator decorators for validation
4. **API Documentation**: Add Swagger decorators to all endpoints

### Code Examples

**Service Implementation**:

```typescript
@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const entity = UserMapper.toEntity(dto);
    const created = await this.userRepository.create(entity);
    return UserMapper.toDto(created);
  }
}
```

**Controller Implementation**:

```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.createUser(dto);
  }
}
```

### Prettier Configuration

The project uses the following Prettier settings:

```json
{
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "printWidth": 120,
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

## Testing Requirements

### MANDATORY Test Verification

**CRITICAL**: Before completing ANY code change task, you MUST:

1. Run all relevant tests: `pnpm api test`
2. Run E2E tests if applicable: `pnpm api test:e2e`
3. **LINT VERIFICATION**: Run linting for the workspace you modified:
   - For API changes: `pnpm api lint`
   - For Web changes: `pnpm web lint`
4. Verify ALL tests pass and ALL lint checks pass
5. If tests or linting fail, fix issues and re-run until all pass
6. Never mark a task complete with failing tests or lint errors
7. **IMPORTANT**: Continue fixing until ALL tests and linting pass - no exceptions
8. **BUILD VERIFICATION**: After tests and lint pass, run `pnpm api build` and ensure build succeeds
9. If build fails, fix all TypeScript/compilation errors and rebuild

### Test Structure

- **Unit Tests**: Located alongside source files (`*.spec.ts`)
- **E2E Tests**: Located in `test/` directory (`*.e2e-spec.ts`)
- **Test Environment Configuration**:
  - **API app**: `apps/api/src/test-setup.ts` (環境変数を直接設定)  
  - **Web app**: Cypress環境設定ファイルでE2Eテスト環境を管理

### Running Tests

```bash
# Run all tests
pnpm api test

# Run unit tests only
pnpm api test -- --selectProjects unit

# Run E2E tests only
pnpm api test:e2e

# Run tests in watch mode
pnpm api test:watch

# Run tests with coverage
pnpm api test:cov
```

### Test Guidelines

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **AAA Pattern**: Follow Arrange-Act-Assert pattern
3. **Isolation**: Mock external dependencies
4. **Coverage**: Aim for 80%+ code coverage
5. **E2E Tests**: Test complete user flows, not individual endpoints

### Example Test

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    const module = Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get(UserService);
    repository = module.get(USER_REPOSITORY);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      // Arrange
      const dto = new CreateUserDto();
      const entity = UserMapper.toEntity(dto);
      repository.create.mockResolvedValue(entity);

      // Act
      const result = await service.createUser(dto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(entity);
      expect(result).toEqual(UserMapper.toDto(entity));
    });
  });
});
```

## Common Commands

### Development Commands

```bash
# Setup & Installation
pnpm setup                 # Complete project setup
pnpm i                    # Install dependencies

# Development
pnpm api start:dev        # Start API in watch mode
pnpm web dev             # Start web app in dev mode

# Building
pnpm build               # Build all packages
pnpm rebuild             # Force rebuild all packages
pnpm api build           # Build API only
pnpm web build           # Build web only

# Testing
pnpm api test            # Run API tests
pnpm api test:e2e        # Run E2E tests
pnpm api test:cov        # Run tests with coverage
pnpm web test:e2e        # Run web E2E tests (Cypress)
pnpm test:container      # Test Docker containers

# Database
pnpm api db:generate     # Generate Prisma client
pnpm api db:push         # Push schema to database
pnpm api db:force-push   # Force push (data loss warning!)

# Code Quality
pnpm api lint            # Lint API code
pnpm web lint            # Lint web code
pnpm api format          # Format API code

# Docker & Infrastructure
pnpm setup:db            # Start database containers and NATS
pnpm reset-docker        # Reset Docker containers
pnpm kill-port 3000      # Kill process on port

# NATS Monitoring
# Access NATS monitoring at http://localhost:8222

# Git Helpers
pnpm git:ai-commit       # Generate commit message with Claude Code (fallback to Ollama)
pnpm git:push            # Push with tags
pnpm git:log             # View commit history

# Release Management
pnpm release:patch       # Patch release (x.x.X)
pnpm release:minor       # Minor release (x.X.0)
pnpm release:major       # Major release (X.0.0)
```

### Workspace-Specific Commands

```bash
# Run commands in specific workspace
pnpm --filter api <command>
pnpm --filter web <command>

# Or use shortcuts
pnpm api <command>
pnpm web <command>
```

## Git Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch (if used)
- `feature/*`: New features
- `fix/*`: Bug fixes
- `chore/*`: Maintenance tasks

### Commit Message Format

Follow the conventional commits specification:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance tasks
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `style`: Code style changes (formatting)
- `perf`: Performance improvements
- `build`: Build system changes
- `ci`: CI/CD changes

**Examples**:

```bash
feat: implement user authentication with better-auth
fix: resolve database connection timeout issue
chore: update dependencies to latest versions
docs: add API documentation for user endpoints
```

### AI-Powered Commits

The project includes an AI commit message generator using Claude Code CLI (with Ollama fallback):

```bash
# Stage your changes
git add .

# Generate commit message with Claude Code (interactive mode)
pnpm git:ai-commit

# Auto-commit without confirmation
pnpm git:ai-commit --commit

# Force Ollama usage (bypass Claude)
./scripts/ai-commit-message.sh --ollama

# Use different Ollama model
OLLAMA_MODEL=llama3.2:3b pnpm git:ai-commit
```

**Setup Requirements:**
- **Primary**: Claude Code must be running (the `claude` command)
- **Fallback**: Ollama with llama3:instruct model

The script uses your existing Claude Code session - no API key required!

### Git Hooks Integration

The project uses git hooks for automated quality checks instead of GitHub Actions:

- **Pre-commit**: Runs linting and formatting
- **Pre-push**: Runs tests to ensure code quality
- **Commit-msg**: Validates commit message format
- Hooks are configured during `pnpm setup`

### Pull Request Process

1. Create feature branch from `main`
2. Make changes following coding conventions
3. Write/update tests (hooks will validate on commit/push)
4. Ensure all tests pass
5. Update documentation if needed
6. Create PR with descriptive title and description
7. Address review feedback
8. Merge after approval

## Testing and Development Information

### HTTP API Testing

- **REST Client File**: `rest-client/auth.http` - API エンドポイントのテスト用
- **API Base URL**: http://localhost:8080
- **Current Available Endpoints**:
  - `GET /health-check` - サーバーヘルスチェック
  - `GET /health-check/db` - データベースヘルスチェック
  - `GET /users` - 全ユーザー取得
  - `POST /users` - ユーザー作成 (email, name, age必須)
  - `GET /users/:id` - ユーザー詳細取得
  - `PUT /users/:id` - ユーザー更新
  - `DELETE /users/:id` - ユーザー削除

### Current Project Status

- **Authentication**: better-authの実装は未完了（authディレクトリ未作成）
- **Available Features**: ユーザー管理機能のみ利用可能
- **Database**: PostgreSQLコンテナで動作中
- **Testing**: REST Clientファイルで手動テスト可能

### User Data Model

```typescript
// CreateUserDto (required fields)
{
  name: string,     // 必須
  email: string,    // 必須（email形式）
  age: number       // 必須（0-120の整数）
}

// UserResponseDto
{
  id: string,
  name?: string,
  email: string,
  age?: number,
  createdAt: Date
}
```

### Debugging Tips

- APIサーバーが起動しない場合: `pnpm setup:db` でDB起動後、`PORT=8080 pnpm api start:dev`
- ポート競合の場合: `lsof -ti:8080 | xargs kill -9` でプロセス終了
- サーバー動作確認: `curl http://localhost:8080/health-check`
- 環境変数設定: API server起動時に `PORT=8080` を明示的に設定

## Project-Specific Considerations

### Authentication Architecture (Auth0 Integration)

**Architecture Decision**: Auth0-based authentication with NestJS JWT validation

#### Service Responsibilities

**🔐 Auth0 Service** (External SaaS):
- User registration and authentication
- Password management and security
- Social login providers (Google, GitHub, etc.)
- JWT token generation with JWKS rotation
- Compliance and security auditing

**🏗️ API Server** (`apps/api` - Port 8080):
- Auth0 JWT token validation via JWKS
- User profile management with Auth0 integration
- Business logic and application features
- Protected resource access with Auth0 claims
- Dynamic user creation from Auth0 identity

#### Authentication Flow

```
1. User Login (Frontend):
   GET http://localhost:3000/api/auth/login
   → Redirects to Auth0 login page
   
2. Auth0 Authentication:
   User authenticates via Auth0 (email/password, social login)
   → Auth0 generates JWT token
   
3. Callback & Token Exchange:
   GET http://localhost:3000/api/auth/callback
   → Receives Auth0 JWT token
   
4. API Access with Auth0 Token:
   GET http://localhost:8080/users/me
   Authorization: Bearer <auth0_jwt_token>
```

#### Implementation Details
- **Auth0 Management**: Fully managed authentication service
- **API Database**: Contains application-specific user data linked to Auth0 user ID
- **Token Format**: RS256 JWT with Auth0 claims (sub, email, name, picture)
- **Session Management**: Auth0 Next.js SDK with automatic token refresh
- **Security**: Auth0 enterprise-grade security, JWKS key rotation

#### Key Principles
- ✅ Authentication responsibilities delegated to Auth0
- ✅ API server focuses on business logic with JWT validation
- ✅ Auth0 JWT tokens for stateless API authentication
- ✅ Dynamic user creation from Auth0 identity claims
- ✅ Enterprise-grade security and compliance
- ✅ Zero maintenance authentication infrastructure

### Event-Driven Architecture (NATS + Outbox Pattern)

**Architecture Decision**: Reliable event publishing using transactional outbox pattern with NATS

#### Message Bus Infrastructure

**🔄 NATS Server** (Docker Container - Port 4222):
- JetStream enabled for persistent messaging
- Queue-based load balancing for consumers
- HTTP monitoring dashboard on port 8222
- Automatic failover and replay capabilities

**📦 Outbox Pattern** (Auth Server):
- Transactional event persistence in `outbox_event` table
- Guaranteed at-least-once delivery
- Automatic retry with exponential backoff
- Dead letter queue for failed events
- Background processor for async publishing

#### Event Flow

```
1. Domain Operation (e.g., User Registration):
   Auth Service → Save User + Save Event (same transaction)
   
2. Event Publishing:
   Background Processor → Read Outbox → Publish to NATS → Mark as Published
   
3. Event Consumption:
   API Server → Subscribe to NATS → Process Domain Events
```

#### Event Types

- `auth.user.created`: Published when new user registers
- Future events: `auth.user.updated`, `auth.user.deleted`, etc.

#### Configuration

Environment variables for NATS:
- `NATS_HOST`: NATS server host (default: localhost)
- `NATS_PORT`: NATS server port (default: 4222)
- `OUTBOX_PROCESSING_INTERVAL_MS`: Event processing frequency (default: 5000ms)

#### Key Benefits
- ✅ Transactional integrity (outbox pattern)
- ✅ High availability and scaling (NATS)
- ✅ Event replay and persistence (JetStream)
- ✅ Automatic retry and error handling
- ✅ Monitoring and observability

### CQRS & Event Sourcing (Planned)

- **CQRS Library**: node-sqrs
- Commands: Write operations that change state
- Queries: Read operations that don't change state
- Events: Domain events for loose coupling
- Event Store: Audit trail of all changes using node-sqrs
- Follow node-sqrs documentation for implementation patterns

### Repository Pattern

- All data access goes through repository interfaces
- Implementations are in `infrastructure/repositories/`
- Use dependency injection with custom tokens

### Environment Variables

- Use `.env.example` as template
- Never commit `.env` files
- Required variables:
  - `DATABASE_URL`: PostgreSQL connection string
  - `JWT_SECRET`: Authentication secret
  - `PORT`: API server port (default: 8080)
  - `BETTER_AUTH_URL`: Better Auth URL (default: http://localhost:8080)
  - `BETTER_AUTH_SECRET`: Better Auth secret key

### Docker Development

- Database runs in Docker by default
- Use `docker-compose` for local development
- Container tests available via `pnpm test:container`

### REST Client Testing

- HTTP request files in `rest-client/`
- Use these for manual API testing
- Supports VS Code REST Client extension

### Performance Considerations

- Use pagination for list endpoints
- Implement caching where appropriate
- Use database indexes for frequently queried fields
- Consider rate limiting for public endpoints

### Error Handling

The project uses a **Global Exception Filter** for centralized error handling:

#### Features

- **Consistent Error Responses**: All errors follow the same response format
- **Business Exceptions**: Custom exception classes for different error scenarios
- **Automatic Error Classification**: Maps errors to appropriate HTTP status codes
- **Development/Production Modes**: Stack traces only in development
- **Prisma Error Handling**: Handles database constraint violations

#### Exception Types

- `BusinessException`: Base exception for business logic errors
- `ValidationException`: Input validation errors (400)
- `ResourceNotFoundException`: Resource not found (404)
- `DuplicateResourceException`: Duplicate resource conflicts (409)
- `UnauthorizedException`: Authentication failures (401)
- `ForbiddenException`: Authorization failures (403)
- `ServiceUnavailableException`: External service failures (503)
- `DataIntegrityException`: Data integrity violations (422)

#### Error Response Format

```json
{
  "statusCode": 409,
  "timestamp": "2025-07-19T03:00:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "error": "Conflict",
  "message": "User with email 'test@example.com' already exists",
  "details": { ... }  // Optional
}
```

#### Testing Errors

Use `rest-client/error-testing.http` to test various error scenarios.

### Security Best Practices

- Always validate input with DTOs
- Use parameterized queries (Prisma handles this)
- Implement proper authentication/authorization
- Keep dependencies updated
- Use environment variables for secrets

### Environment Variable Security

**CRITICAL**: Never share or transmit environment variables outside the local development environment:

- **NEVER** include `.env` files in git commits
- **NEVER** share environment variables in chat messages, logs, or external communications
- **NEVER** transmit Auth0 secrets, database passwords, or API keys to external services
- **ALWAYS** use `.env.example` as template without actual values
- **ALWAYS** store production secrets in secure credential management systems
- If Claude AI needs to help with environment configuration, only share variable names (not values)
- Use placeholder values in documentation and examples

### Future Enhancements

Refer to `TODO.md` for planned features:

- Complete CQRS implementation using node-sqrs
- Event sourcing infrastructure using node-sqrs
- Tremor dashboard components (follow official docs)
- Multi-provider authentication
- Advanced monitoring and logging

**Note**:

- No microservices architecture planned - monolithic approach
- Uses git hooks for automation instead of GitHub Actions CI/CD
- Local development workflow with git hooks for quality gates

## Troubleshooting

### Common Issues

**Database Connection Issues**:

```bash
# Restart database container
pnpm reset-docker
pnpm setup:db
```

**Port Already in Use**:

```bash
# Kill process on specific port
pnpm kill-port 3000
```

**IMPORTANT**: When a port is already in use, terminate the existing process and use the specified port. Do not use alternative ports as substitutes.

**Dependency Issues**:

```bash
# Clean install
pnpm remove-node-modules
pnpm i
```

**Build Failures**:

```bash
# Force rebuild
pnpm rebuild
```

### Getting Help

1. Check existing documentation
2. Review test files for usage examples
3. Check `TODO.md` for known limitations
4. Examine similar implementations in the codebase

## Best Practices Summary

1. **Always write tests** for new features
2. **MANDATORY: Run and verify all tests pass** before completing any task
3. **MANDATORY: Fix until tests and build succeed** - Continue debugging and fixing until both tests and build are successful
4. **Follow the established patterns** in the codebase
5. **Keep commits atomic** and well-described
6. **Update documentation** when changing APIs
7. **Use TypeScript strictly** - no `any` types
8. **Handle errors properly** with appropriate status codes
9. **Log important operations** for debugging
10. **Keep dependencies updated** but test thoroughly
11. **Use the repository pattern** for data access
12. **Follow RESTful conventions** for API design
13. **Remove unnecessary files** - Delete temporary files, unused code, and obsolete configurations
14. **Update README** when adding new features or changing project setup

---

By following these guidelines, you'll ensure consistent, high-quality contributions to the Fullstack Event Kit project. Remember to check `TODO.md` for upcoming features and priorities.

# Claude AI Development Guidelines

This document provides essential guidelines for Claude AI when working on the fullstack-event-kit project.

**For project overview, setup instructions, and technology stack, see [README.md](README.md).**

## Development Workflow

### Setup

```bash
pnpm setup  # Complete project setup (install, build, DB, hooks)
```

### Daily Development

```bash
pnpm api start:dev        # Start API server (port 8080)
pnpm web dev             # Start web app (port 3000)
pnpm kill-port 3000      # Kill process on specific port (if needed)
```

### Port Configuration

- **API Server**: http://localhost:8080 (NestJS with Auth0 JWT validation)
- **Web Application**: http://localhost:3000 (Next.js with Auth0 authentication)
- **Database (PostgreSQL)**: localhost:5433
- **NATS Message Bus**: localhost:4222 (client), localhost:8222 (monitoring)

## Code Style and Conventions

### TypeScript Guidelines

1. **Strict Mode**: Always use TypeScript strict mode
2. **Explicit Types**: Prefer explicit type annotations for function parameters and return types
3. **Naming Conventions**:
   - PascalCase: Classes, Interfaces, Types, Enums
   - camelCase: Variables, functions, methods
   - UPPER_SNAKE_CASE: Constants
   - kebab-case: File names

### NestJS Specific Conventions

- **Module Structure**: `feature/dto/`, `feature/entities/`, `feature/services/`
- **Dependency Injection**: Always use constructor injection
- **DTOs**: Use shared Zod schemas for type safety
- **API Documentation**: Add Swagger decorators to all endpoints

## Testing Requirements

### MANDATORY Test Verification

**CRITICAL**: Before completing ANY code change task, you MUST:

1. Run all relevant tests: `pnpm api test`
2. Run E2E tests if applicable: `pnpm api test:e2e`
3. **LINT VERIFICATION**: Run linting for the workspace you modified:
   - For API changes: `pnpm api lint`
   - For Web changes: `pnpm web lint`
4. Verify ALL tests pass and ALL lint checks pass
5. **BUILD VERIFICATION**: After tests and lint pass, run `pnpm api build` and ensure build succeeds
6. **MANDATORY: Fix until tests and build succeed** - Continue fixing and debugging until both tests and build are successful
7. **IMPORTANT**: Continue fixing until ALL tests and linting pass - no exceptions

### Test Structure

- **Unit Tests**: Located alongside source files (`*.spec.ts`)
- **E2E Tests**: Located in `test/` directory (`*.e2e-spec.ts`)
- **Web E2E**: Cypress tests in `apps/web/cypress/`

### Commit Message Format

Follow conventional commits: `<type>: <description>`

**Best Practices for Commit Messages:**

1. **Check commit history**: Always run `git log --oneline -10` to see recent commit patterns
2. **Follow project style**: Match the tone, format, and structure of existing commits
3. **Use consistent prefixes**: Follow the project's convention (`feat:`, `fix:`, `refactor:`, etc.)
4. **Keep it concise**: Follow the established length and detail level of commit messages

## Project-Specific Considerations

### Authentication Architecture

- **Auth0**: External service for enterprise authentication
- **JWT Validation**: API server validates Auth0 JWT tokens using JWKS
- **Global AuthGuard**: All endpoints protected by default, use `@Public()` decorator for public routes
- **User Management**: API manages user profiles, Auth0 handles authentication

### Repository Pattern

- All data access goes through repository interfaces
- Implementations are in `infrastructure/repositories/`
- Use dependency injection with custom tokens

### Environment Variables

- **Security**: Never commit `.env` files or share actual values.
- **EnvConfig Usage**: ALWAYS use the `EnvConfig` class to access environment variables instead of directly accessing `process.env`. This ensures type safety and centralized configuration management.
- **Adding New Variables**: When adding new environment variables:
  1. Add the variable to the `ApiConfig` interface in `src/config/env.config.ts`
  2. Add the variable to the `loadConfig()` method with appropriate default values
  3. Add a static getter method for easy access
  4. Update both `.env` and `.env.example` files

### Error Handling

- **Global Exception Filter**: Centralized error handling for consistent API responses
- **Business Exceptions**: Use custom exception classes for different error scenarios
- **HTTP Status Codes**: Automatically mapped from exception types

## Best Practices Summary

1. **Always write tests** for new features
2. **MANDATORY: Run and verify all tests pass** before completing any task
3. **Follow the established patterns** in the codebase
4. **Keep commits atomic** and well-described
5. **Use TypeScript strictly** - no `any` types
6. **Update documentation** when changing APIs
7. **Handle errors properly** with appropriate status codes
8. **Use the repository pattern** for data access
9. **Follow RESTful conventions** for API design
10. **Remove unnecessary files** - Delete temporary files, unused code, and obsolete configurations
11. **Update README** when adding new features or changing project setup

---

**Remember**: Check [README.md](README.md) for setup instructions, technology details, and project overview.

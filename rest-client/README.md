# REST Client - Fullstack Event Kit API Testing

This directory contains comprehensive HTTP request files for testing all API endpoints using the VS Code REST Client extension or similar tools.

## Prerequisites

1. **Install REST Client Extension** (for VS Code):
   - [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

2. **Start Required Services**:
   ```bash
   # Start database
   pnpm setup:db
   
   # Start API server (port 8080)
   pnpm api start:dev
   
   # Start auth server (port 4000)  
   pnpm --filter auth start:dev
   ```

## Architecture Overview

- **API Server**: `http://localhost:8080` - User management and business logic
- **Auth Server**: `http://localhost:4000` - Authentication with Lucia Auth + JWT
- **Database**: `localhost:5433` - PostgreSQL with separate schemas
- **Web App**: `http://localhost:3000` - Next.js frontend

## Test Files Organization

### 📋 **`api.http`** - Overview & Quick Start
- Main index file with quick tests
- Server availability checks
- Common variables and documentation links

### 🔐 **`auth.http`** - Authentication Server (Port 4000)
- **Core Features**: Register, login, logout, profile management
- **Multi-User Testing**: Multiple user sessions and JWT validation
- **Health Monitoring**: Service availability checks
- **13 positive flow test cases** covering successful authentication workflows

### 👤 **`users.http`** - User Management API (Port 8080)
- **Profile Management**: Get user by ID, update profile, list users
- **Note**: User creation handled by auth server (microservices pattern)
- **Future Features**: JWT-protected endpoints, admin functionality

### 🏥 **`health.http`** - Health Checks & Monitoring
- **API Server**: Basic health, database connectivity
- **Auth Server**: Service availability checks
- **Future Features**: Metrics, performance monitoring, request stats

### 🔄 **`integration-testing.http`** - Complete Workflow Testing
- **User Lifecycle**: Register → Login → Profile → Logout workflows
- **Multi-User Testing**: Concurrent sessions and batch operations
- **Session Management**: JWT validation and session lifecycle
- **Cross-Service Integration**: Auth server ↔ API server interactions
- **Future Features**: NATS event-driven synchronization testing

## Usage Guide

### Quick Start
1. Open `api.http` for overview and quick server checks
2. Use `auth.http` to test authentication flow
3. Use `users.http` for profile management testing
4. Use `health.http` for monitoring server status
5. Use `integration-testing.http` for complete workflow testing

### Testing Workflow
```bash
# 1. Check server availability
api.http → Quick Tests section

# 2. Test authentication
auth.http → Register → Login → Get Profile → Logout

# 3. Test user management  
users.http → Get users → Get specific user → Update profile

# 4. Test complete workflows
integration-testing.http → Complete user lifecycle scenarios
```

## Server Endpoints Summary

### Auth Server (4000)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT)
- `GET /auth/me` - Current user profile (JWT required)
- `GET /auth/session` - Session validation (JWT required) 
- `POST /auth/logout` - Logout (JWT required)
- `GET /auth/health` - Health check

### API Server (8080)
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `GET /health-check` - Basic health check
- `GET /health-check/db` - Database connectivity check

### Architecture Notes
- **Separate Databases**: Auth and API servers use independent databases
- **JWT Authentication**: Auth server issues JWTs for API server validation
- **Microservices Pattern**: User creation in auth server, profile management in API server
- **Future Enhancement**: NATS event-driven synchronization (see TODO.md)

## Troubleshooting

### Common Issues
1. **Connection Refused**: Ensure servers are running on correct ports
2. **401 Unauthorized**: Check JWT token validity and format
3. **404 Not Found**: Verify endpoint URLs and user existence
4. **409 Conflict**: Email already exists in auth server

### Debug Commands
```bash
# Check server status
curl -I http://localhost:8080/health-check
curl -I http://localhost:4000/auth/health

# Verify database connection
curl http://localhost:8080/health-check/db

# Test basic endpoints
curl http://localhost:8080/users
curl http://localhost:4000/auth/health
```

## Future Enhancements
- Password change endpoints
- Email verification flow
- Password reset functionality  
- Refresh token mechanism
- Admin user management
- Metrics and monitoring endpoints
- NATS event-driven user synchronization

For implementation details, see:
- `/apps/auth/src/auth/` - Authentication implementation
- `/apps/api/src/users/` - User management implementation
- `TODO.md` - Planned features and architecture improvements

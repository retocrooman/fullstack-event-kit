# Authentication System Documentation

## Overview

This authentication system provides a modern, secure solution for user authentication and authorization in the NestJS API. Built on **Better Auth**, it offers a comprehensive authentication framework with support for multiple providers, secure session management, and modern authentication patterns.

**Server Configuration**: API runs on port **8080** (http://localhost:8080)

## Architecture

### Core Components

1. **AuthModule** - Main authentication module integrating Better Auth with NestJS
2. **AuthController** - REST API endpoints for authentication operations
3. **BetterAuthService** - Better Auth integration service
4. **BetterAuthRepositoryImpl** - Repository implementation using Better Auth APIs
5. **AuthGuard** - Route protection middleware with session validation
6. **Database Models** - Prisma-based data persistence layer with Better Auth schema

### Security Features

- **Better Auth Integration**: Modern authentication library with built-in security
- **Session Management**: Secure session handling with database persistence
- **Password Security**: Argon2 hashing via Better Auth
- **Input Validation**: Comprehensive request validation with class-validator
- **CSRF Protection**: Built-in protection through Better Auth
- **Rate Limiting**: Configurable through Better Auth settings

## Database Schema

The database schema follows Better Auth conventions with additional project-specific fields.

### Users Table (`user`)

```sql
- id: string (CUID primary key)
- email: string (unique)
- emailVerified: boolean
- name: string (optional)
- image: string (optional)
- createdAt: DateTime
- updatedAt: DateTime
```

### Sessions Table (`session`)

```sql
- id: string (CUID primary key)
- userId: string (foreign key to user)
- token: string (unique session token)
- expiresAt: DateTime
- ipAddress: string (optional)
- userAgent: string (optional)
- createdAt: DateTime
- updatedAt: DateTime
```

### Accounts Table (`account`)

```sql
- id: string (CUID primary key)
- userId: string (foreign key to user)
- accountId: string
- providerId: string
- accessToken: string (optional)
- refreshToken: string (optional)
- idToken: string (optional)
- accessTokenExpiresAt: DateTime (optional)
- refreshTokenExpiresAt: DateTime (optional)
- scope: string (optional)
- password: string (optional, hashed)
- createdAt: DateTime
- updatedAt: DateTime
```

### Verification Table (`verification`)

```sql
- id: string (CUID primary key)
- identifier: string
- value: string
- expiresAt: DateTime
- createdAt: DateTime
- updatedAt: DateTime
```

### Better Auth Features

- **Argon2 Password Hashing**: Secure password storage using industry-standard hashing
- **Session Management**: Automatic session creation, validation, and cleanup
- **CSRF Protection**: Built-in CSRF token validation
- **Rate Limiting**: Configurable rate limiting for authentication endpoints

## API Endpoints

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "user": {
    "id": "cmd6w4tt90000ip5ghmrdrx9p",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "image": null,
    "createdAt": "2025-01-17T04:29:10.510Z",
    "updatedAt": "2025-01-17T04:29:10.510Z"
  },
  "token": "oCh5IO7qtc8APdZHMj0veMqrLFK7Q0Re"
}
```

#### POST /auth/login

Authenticate user with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "user": {
    "id": "cmd6w4tt90000ip5ghmrdrx9p",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "image": null,
    "createdAt": "2025-01-17T04:29:10.510Z",
    "updatedAt": "2025-01-17T04:29:10.510Z"
  },
  "token": "oCh5IO7qtc8APdZHMj0veMqrLFK7Q0Re"
}
```

#### POST /auth/logout

Logout user and blacklist current token.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "message": "Logout successful"
}
```

#### GET /auth/me

Get current user profile.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "id": "cmd6w4tt90000ip5ghmrdrx9p",
  "email": "user@example.com",
  "name": "John Doe",
  "emailVerified": false,
  "image": null,
  "age": null,
  "createdAt": "2025-01-17T04:29:10.510Z",
  "updatedAt": "2025-01-17T04:29:10.510Z"
}
```

#### GET /auth/validate

Validate current session and token.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "valid": true,
  "user": {
    "id": "cmd6w4tt90000ip5ghmrdrx9p",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "image": null,
    "createdAt": "2025-01-17T04:29:10.510Z",
    "updatedAt": "2025-01-17T04:29:10.510Z"
  }
}
```

#### GET /auth/session

Get current session information (Better Auth endpoint).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "token": "session_token",
    "expiresAt": "2025-07-20T02:36:07.037Z"
  },
  "user": {
    "id": "cmd6w4tt90000ip5ghmrdrx9p",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "image": null
  }
}
```

#### POST /auth/sign-out

Alternative logout endpoint via Better Auth.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response:**

```json
{
  "success": true
}
```

#### ALL /auth/*

Better Auth handler for all authentication routes. This endpoint handles Better Auth specific routes and operations.

**Note**: This is a catch-all route that delegates to Better Auth's internal handler.

Better Auth handles session management automatically with the following features:

### Session Features

1. **Automatic Session Creation**: Sessions are created automatically on successful login
2. **Database Persistence**: Sessions are stored in the database for persistence
3. **Session Validation**: Built-in session validation for protected routes
4. **Automatic Cleanup**: Expired sessions are automatically cleaned up
5. **Secure Tokens**: Session tokens are cryptographically secure

### Session Lifecycle

1. **Login**: User authenticates and receives a session token
2. **Validation**: Each request validates the session token against the database
3. **Logout**: Session is invalidated and removed from the database
4. **Expiration**: Sessions automatically expire after the configured time

### Security Features

- **CSRF Protection**: Built-in CSRF token validation
- **Session Fixation Protection**: New session ID on authentication
- **Secure Cookie Handling**: Secure cookie attributes when using cookies
- **Rate Limiting**: Built-in rate limiting for authentication endpoints

## Security Considerations

### Password Security

- Passwords are hashed using bcrypt with configurable salt rounds (default: 10)
- Minimum password requirements enforced via validation
- No plaintext passwords stored in database

### JWT Security

- Tokens include unique identifiers (`jti`) for tracking
- Configurable expiration times (default: 7 days)
- Secret key should be strong and environment-specific
- Tokens are blacklisted on logout/refresh

### Session Security

- Sessions have configurable expiration times
- IP address and user agent tracking (optional)
- Automatic cleanup of expired sessions

### Input Validation

- All inputs validated using class-validator
- Email format validation
- Password strength requirements
- Request sanitization to prevent injection attacks

## Configuration

### Environment Variables

```env
# Server Configuration
PORT=8080

# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-better-auth-key
BETTER_AUTH_URL=http://localhost:8080

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5433/db?schema=public

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Better Auth Configuration

```typescript
// apps/api/src/auth/better-auth.config.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || '',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8080',
});
```

## Usage Examples

### Protecting Routes

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('protected')
export class ProtectedController {
  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
```

### Role-Based Access Control

```typescript
import { Roles } from '../auth/decorators/roles.decorator';

@Get('admin')
@UseGuards(AuthGuard)
@Roles('admin')
getAdminData(@CurrentUser() user: User) {
  return { message: 'Admin only data' };
}
```

### Manual Token Validation

```typescript
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SomeService {
  constructor(private authService: AuthService) {}

  async validateToken(token: string) {
    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been invalidated');
    }
    // Continue with token validation...
  }
}
```

## REST Client Testing

### Using auth.http File

The project includes a comprehensive REST Client file for testing authentication endpoints:

**File**: `rest-client/auth.http`

#### Features

- **Automatic JWT Token Extraction**: Uses VS Code REST Client's official syntax
- **Request Variables**: Named requests with `@name` directive
- **Token Reuse**: Automatic token injection into subsequent requests

#### Quick Start

1. **Install VS Code REST Client Extension**
2. **Open** `rest-client/auth.http`
3. **Run Login Request** (marked "RUN THIS FIRST!")
4. **Token Auto-Extracted** using `{{login.response.body.token}}`
5. **Use Authenticated Endpoints** automatically

#### Example Usage

```http
# 1. Login (auto-extracts token)
# @name login
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

# 2. Token automatically extracted
@auth_token = {{login.response.body.token}}

# 3. Use token in subsequent requests
GET http://localhost:8080/auth/me
Authorization: Bearer {{auth_token}}
```

#### Available Test Scenarios

- **User Registration & Login**
- **Authentication Flow Testing**
- **Error Handling (invalid credentials, malformed requests)**
- **Token Validation & Session Management**
- **Multiple User Testing**
- **Better Auth Specific Endpoints**

#### Benefits

- ✅ **No Manual Token Copy/Paste**
- ✅ **Official VS Code REST Client Syntax**
- ✅ **Comprehensive Test Coverage**
- ✅ **Real API Testing Against Port 8080**

## Testing

### E2E Tests

The authentication system includes comprehensive end-to-end tests covering:

- User registration and validation
- Login with various scenarios
- Token refresh functionality
- Logout and token blacklisting
- Protected route access
- Multiple user sessions
- Error handling and edge cases

### Running Tests

```bash
# Run authentication e2e tests
pnpm run test:e2e -- auth.e2e-spec.ts

# Run with timeout for slower systems
pnpm run test:e2e -- auth.e2e-spec.ts --testTimeout=10000
```

## Maintenance

### Token Cleanup

Expired blacklisted tokens should be cleaned up periodically:

```typescript
// Manual cleanup
await authService.cleanupExpiredBlacklistedTokens();

// Scheduled cleanup (recommended)
@Cron('0 0 * * *') // Daily at midnight
async handleTokenCleanup() {
  await this.authService.cleanupExpiredBlacklistedTokens();
}
```

### Session Management

Monitor and manage user sessions:

```typescript
// Logout all sessions for a user
await authService.logoutUser(userId);

// Get active sessions (implement as needed)
const sessions = await prisma.userSession.findMany({
  where: { userId, expiresAt: { gt: new Date() } },
});
```

## Future Enhancements

### Planned Features

- OAuth integration (Google, GitHub)
- Email verification system
- Password reset functionality
- Two-factor authentication (2FA)
- Rate limiting for authentication endpoints
- Advanced session management
- Audit logging for security events

### OAuth Integration

The database schema already supports OAuth accounts. Implementation would include:

```typescript
// OAuth account linking
async linkOAuthAccount(userId: string, provider: string, accountData: any) {
  return this.prisma.oAuthAccount.create({
    data: {
      userId,
      provider,
      providerAccountId: accountData.id,
      accessToken: accountData.access_token,
      refreshToken: accountData.refresh_token,
      // ... other OAuth data
    }
  });
}
```

## Troubleshooting

### Common Issues

1. **Token Still Valid After Logout**
   - Check if blacklist functionality is enabled
   - Verify AuthGuard is checking blacklist
   - Ensure database connection is working

2. **High Database Load**
   - Implement token cleanup job
   - Add database indexes on frequently queried fields
   - Consider token expiration time optimization

3. **Authentication Failures**
   - Verify JWT secret configuration
   - Check token format and structure
   - Validate database schema matches expectations

### Debug Mode

Enable debug logging for authentication:

```typescript
// In auth.service.ts
private readonly logger = new Logger(AuthService.name);

async validateToken(token: string) {
  this.logger.debug(`Validating token: ${token.substring(0, 20)}...`);
  // ... validation logic
}
```

## Conclusion

This authentication system provides a modern, secure foundation for user authentication built on **Better Auth**. The integration with NestJS offers a comprehensive solution that combines the power of Better Auth's built-in security features with the flexibility of a custom API.

### Key Benefits

- **Modern Authentication**: Leverages Better Auth's industry-standard security practices
- **Easy Testing**: Comprehensive REST Client file with automatic token management
- **Secure by Default**: Built-in CSRF protection, secure session handling, and Argon2 password hashing
- **Extensible**: Ready for OAuth providers and additional authentication methods
- **Developer Friendly**: Clear API documentation and testing tools

### Server Information

- **API Server**: http://localhost:8080
- **Database**: PostgreSQL on port 5433
- **Authentication**: Better Auth with session-based token management

The system is production-ready and follows modern security best practices while maintaining ease of development and testing.

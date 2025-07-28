// Load test environment variables (matching .env.test values)
process.env.DATABASE_URL = "postgresql://user:password@localhost:5433/api_db?schema=public";
process.env.JWT_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuH+sEqNjiYVeY\n-----END PUBLIC KEY-----";
process.env.AUTH_SERVER_URL = "http://localhost:4000";
process.env.PORT = "8080";
process.env.NODE_ENV = "test";
process.env.ALLOWED_ORIGINS = "http://localhost:3000";

// Auth0 Test Configuration
process.env.AUTH0_DOMAIN = "test-domain.auth0.com";
process.env.AUTH0_AUDIENCE = "https://test-api";
process.env.AUTH0_ISSUER_BASE_URL = "https://test-domain.auth0.com";
process.env.AUTH0_CLIENT_ID = "test-client-id";
process.env.AUTH0_CLIENT_SECRET = "test-client-secret";
process.env.AUTH0_SECRET = "test-auth0-secret";
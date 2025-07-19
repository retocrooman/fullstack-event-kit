// Load test environment variables (matching .env.test values)
process.env.DATABASE_URL = "postgresql://test:test@localhost:5433/test_auth";
process.env.JWT_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4f6wSo2OJhV5j\n-----END PRIVATE KEY-----";
process.env.JWT_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuH+sEqNjiYVeY\n-----END PUBLIC KEY-----";
process.env.BETTER_AUTH_SECRET = "test-secret-key-for-testing";
process.env.BETTER_AUTH_URL = "http://localhost:4000";
process.env.PORT = "4000";
process.env.NODE_ENV = "test";
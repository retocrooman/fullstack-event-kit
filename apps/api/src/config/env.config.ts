import { Injectable } from '@nestjs/common';

export interface ApiConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  eventstoreMongodbUrl: string;
  eventstoreMongodbHost: string;
  eventstoreMongodbPort: number;
  eventstoreMongodbDbName: string;
  eventstoreMongodbUsername: string;
  eventstoreMongodbPassword: string;
  jwtPublicKey: string;
  authServerUrl: string;
  allowedOrigins: string[];
  auth0Domain: string;
  auth0Audience: string;
  auth0IssuerBaseUrl: string;
  auth0Secret: string;
}

@Injectable()
export class EnvConfig {
  private static _instance: ApiConfig;

  static get config(): ApiConfig {
    if (!this._instance) {
      this._instance = this.loadConfig();
    }
    return this._instance;
  }

  private static loadConfig(): ApiConfig {
    const required = (key: string): string => {
      const value = process.env[key];
      if (!value) {
        throw new Error(`Required environment variable ${key} is not set`);
      }
      return value;
    };

    const optional = (key: string, defaultValue: string): string => {
      return process.env[key] || defaultValue;
    };

    return {
      port: parseInt(optional('PORT', '8080'), 10),
      nodeEnv: optional('NODE_ENV', 'development'),
      databaseUrl: optional('DATABASE_URL', 'postgresql://user:password@localhost:5433/api_db?schema=public'),
      eventstoreMongodbUrl: optional('EVENTSTORE_MONGODB_URL', 'mongodb://eventstore:password@localhost:27017/eventstore?authSource=admin'),
      eventstoreMongodbHost: optional('EVENTSTORE_MONGODB_HOST', 'localhost'),
      eventstoreMongodbPort: parseInt(optional('EVENTSTORE_MONGODB_PORT', '27017'), 10),
      eventstoreMongodbDbName: optional('EVENTSTORE_MONGODB_DB_NAME', 'eventstore'),
      eventstoreMongodbUsername: optional('EVENTSTORE_MONGODB_USERNAME', 'eventstore'),
      eventstoreMongodbPassword: optional('EVENTSTORE_MONGODB_PASSWORD', 'password'),
      jwtPublicKey: required('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
      authServerUrl: optional('AUTH_SERVER_URL', 'http://localhost:4000'),
      allowedOrigins: optional('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
      auth0Domain: required('AUTH0_DOMAIN'),
      auth0Audience: required('AUTH0_AUDIENCE'),
      auth0IssuerBaseUrl: required('AUTH0_ISSUER_BASE_URL'),
      auth0Secret: optional('AUTH0_SECRET', 'your-auth0-secret'),
    };
  }

  // Getter methods for easy access
  static get port(): number {
    return this.config.port;
  }

  static get nodeEnv(): string {
    return this.config.nodeEnv;
  }

  static get databaseUrl(): string {
    return this.config.databaseUrl;
  }

  static get eventstoreMongodbUrl(): string {
    return this.config.eventstoreMongodbUrl;
  }

  static get eventstoreMongodbHost(): string {
    return this.config.eventstoreMongodbHost;
  }

  static get eventstoreMongodbPort(): number {
    return this.config.eventstoreMongodbPort;
  }

  static get eventstoreMongodbDbName(): string {
    return this.config.eventstoreMongodbDbName;
  }

  static get eventstoreMongodbUsername(): string {
    return this.config.eventstoreMongodbUsername;
  }

  static get eventstoreMongodbPassword(): string {
    return this.config.eventstoreMongodbPassword;
  }

  static get jwtPublicKey(): string {
    return this.config.jwtPublicKey;
  }

  static get authServerUrl(): string {
    return this.config.authServerUrl;
  }

  static get allowedOrigins(): string[] {
    return this.config.allowedOrigins;
  }

  static get auth0Domain(): string {
    return this.config.auth0Domain;
  }

  static get auth0Audience(): string {
    return this.config.auth0Audience;
  }

  static get auth0IssuerBaseUrl(): string {
    return this.config.auth0IssuerBaseUrl;
  }

  static get auth0Secret(): string {
    return this.config.auth0Secret;
  }

  static get auth0JwksUri(): string {
    return `${this.auth0IssuerBaseUrl}/.well-known/jwks.json`;
  }

  static get auth0Issuer(): string {
    return this.auth0IssuerBaseUrl;
  }

  static get isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  static get isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  static get isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }
}
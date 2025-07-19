import { Injectable } from '@nestjs/common';

export interface AuthConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  betterAuthUrl: string;
  betterAuthSecret: string;
  jwtPrivateKey: string;
  jwtPublicKey: string;
  allowedOrigins: string[];
}

@Injectable()
export class EnvConfig {
  private static _instance: AuthConfig;

  static get config(): AuthConfig {
    if (!this._instance) {
      this._instance = this.loadConfig();
    }
    return this._instance;
  }

  private static loadConfig(): AuthConfig {
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
      port: parseInt(optional('PORT', '4000'), 10),
      nodeEnv: optional('NODE_ENV', 'development'),
      databaseUrl: optional('DATABASE_URL', 'postgresql://user:password@localhost:5434/auth_db?schema=public'),
      betterAuthUrl: optional('BETTER_AUTH_URL', 'http://localhost:4000'),
      betterAuthSecret: required('BETTER_AUTH_SECRET'),
      jwtPrivateKey: required('JWT_PRIVATE_KEY').replace(/\\n/g, '\n'),
      jwtPublicKey: required('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
      allowedOrigins: optional('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:8080').split(','),
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

  static get betterAuthUrl(): string {
    return this.config.betterAuthUrl;
  }

  static get betterAuthSecret(): string {
    return this.config.betterAuthSecret;
  }

  static get jwtPrivateKey(): string {
    return this.config.jwtPrivateKey;
  }

  static get jwtPublicKey(): string {
    return this.config.jwtPublicKey;
  }

  static get allowedOrigins(): string[] {
    return this.config.allowedOrigins;
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
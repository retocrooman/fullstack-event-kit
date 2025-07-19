import { Injectable } from '@nestjs/common';

export interface ApiConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtPublicKey: string;
  authServerUrl: string;
  allowedOrigins: string[];
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
      jwtPublicKey: required('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
      authServerUrl: optional('AUTH_SERVER_URL', 'http://localhost:4000'),
      allowedOrigins: optional('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
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

  static get jwtPublicKey(): string {
    return this.config.jwtPublicKey;
  }

  static get authServerUrl(): string {
    return this.config.authServerUrl;
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
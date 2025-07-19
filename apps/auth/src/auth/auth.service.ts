import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { SignJWT, importPKCS8, jwtVerify, importSPKI } from 'jose';
import { PrismaClient } from '../../node_modules/.prisma/auth-client';
import { EnvConfig } from '../config/env.config';
import { RegisterDto, LoginDto, AuthResponseDto, SessionValidationResponseDto, LogoutResponseDto } from './dto/auth.dto';
import { lucia } from './lucia.config';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hash(dto.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name || null,
        emailVerified: false,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const jwt = await this.createJWT(user, session);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
      jwt,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await verify(user.password, dto.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await lucia.createSession(user.id, {});
    const jwt = await this.createJWT(user, session);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
      jwt,
    };
  }

  async validateSession(sessionId: string) {
    return await lucia.validateSession(sessionId);
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await lucia.invalidateSession(sessionId);
  }

  async getUserFromSession(sessionId: string) {
    const { user, session } = await lucia.validateSession(sessionId);
    return { user, session };
  }

  async validateJWT(token: string): Promise<any> {
    try {
      const fs = await import('fs/promises');
      const publicKeyPem = await fs.readFile('/Users/shiho/Github/fullstack-event-kit/apps/auth/test-public.pem', 'utf8');
      const publicKey = await importSPKI(publicKeyPem, 'RS256');

      const { payload } = await jwtVerify(token, publicKey, {
        issuer: EnvConfig.betterAuthUrl,
        audience: 'http://localhost:3000',
      });

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getCurrentUser(token: string): Promise<SessionValidationResponseDto> {
    const payload = await this.validateJWT(token);
    const sessionId = payload.sessionId as string;
    
    const { user, session } = await lucia.validateSession(sessionId);
    
    if (!user || !session) {
      throw new UnauthorizedException('Invalid session');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
        age: user.age,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  async logout(token: string): Promise<LogoutResponseDto> {
    const payload = await this.validateJWT(token);
    const sessionId = payload.sessionId as string;
    
    await lucia.invalidateSession(sessionId);
    
    return {
      message: 'Successfully logged out',
      success: true,
    };
  }

  private async createJWT(user: any, session: any): Promise<string> {
    // For testing, use file directly
    const fs = await import('fs/promises');
    const privateKeyPem = await fs.readFile('/Users/shiho/Github/fullstack-event-kit/apps/auth/test-private.pem', 'utf8');
    const privateKey = await importPKCS8(privateKeyPem, 'RS256');

    return await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      sessionId: session.id,
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setIssuer(EnvConfig.betterAuthUrl)
      .setAudience('http://localhost:3000')
      .setExpirationTime('7d')
      .sign(privateKey);
  }
}

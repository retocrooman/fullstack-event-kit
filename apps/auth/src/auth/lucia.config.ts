import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { Lucia } from 'lucia';
import { PrismaClient } from '../../node_modules/.prisma/auth-client';
import { EnvConfig } from '../config/env.config';

const prisma = new PrismaClient();

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: EnvConfig.isProduction,
    },
  },
  getUserAttributes: attributes => {
    return {
      email: attributes.email,
      name: attributes.name,
      emailVerified: attributes.emailVerified,
      image: attributes.image,
      age: attributes.age,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      name: string | null;
      emailVerified: boolean;
      image: string | null;
      age: number | null;
    };
  }
}

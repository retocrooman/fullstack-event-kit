import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EnvConfig } from '../../config/env.config';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: EnvConfig.auth0Secret,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  providers: [AuthGuard],
  exports: [AuthGuard, JwtModule, PassportModule],
})
export class AuthModule {}
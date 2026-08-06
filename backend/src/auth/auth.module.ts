import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RsvpModule } from '../rsvp/rsvp.module';
import { IdentityModule } from '../identity/identity.module';
import { YswsConfigModule } from '../ysws-config/ysws-config.module';
import { YswsConfigService } from '../ysws-config/ysws-config.service';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserThrottlerGuard } from './user-throttler.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    JwtModule.registerAsync({
      imports: [ConfigModule, YswsConfigModule],
      inject: [ConfigService, YswsConfigService],
      useFactory: (configService: ConfigService, yswsConfig: YswsConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
          issuer: yswsConfig.program.shortName,
          audience: yswsConfig.program.shortName,
        },
        verifyOptions: {
          issuer: yswsConfig.program.shortName,
          audience: yswsConfig.program.shortName,
        },
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 30 }],
    }),
    RsvpModule,
    IdentityModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    { provide: APP_GUARD, useClass: UserThrottlerGuard },
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}

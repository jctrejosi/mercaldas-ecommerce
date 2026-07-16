import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { CustomerLocalStrategy } from './strategies/customer-local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret =
          configService.get<string>('CUSTOMER_JWT_SECRET') ||
          configService.get<string>('jwt.secret') ||
          'default-secret';
        const expiresIn =
          configService.get<string>('CUSTOMER_JWT_EXPIRES_IN') ||
          configService.get<string>('jwt.expiresIn') ||
          '7d';

        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as
              | `${number}d`
              | `${number}h`
              | `${number}m`
              | `${number}s`,
          },
        };
      },
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [
    CustomerAuthService,
    CustomerJwtStrategy,
    CustomerLocalStrategy,
  ],
  exports: [CustomerAuthService, JwtModule],
})
export class CustomerAuthModule {}

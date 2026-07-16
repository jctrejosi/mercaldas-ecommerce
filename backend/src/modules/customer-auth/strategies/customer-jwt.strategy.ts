import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../database/drizzle.service';
import { customers } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CustomerJwtPayload } from '../customer-auth.service';

interface RequestWithCookies extends Request {
  cookies: {
    customer_access_token?: string;
  };
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly drizzle: DrizzleService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: RequestWithCookies): string | null => {
          return req.cookies?.customer_access_token ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('CUSTOMER_JWT_SECRET') ||
        configService.get<string>('jwt.secret') ||
        'secret-key',
    });
  }

  async validate(payload: CustomerJwtPayload) {
    if (payload.type !== 'customer') {
      throw new UnauthorizedException('Token de cliente inválido');
    }

    const result = await this.drizzle.db
      .select({
        id: customers.id,
        email: customers.email,
        isActive: customers.isActive,
      })
      .from(customers)
      .where(eq(customers.id, BigInt(payload.sub)))
      .limit(1);

    if (!result.length || !result[0].isActive) {
      throw new UnauthorizedException('Cliente no válido o inactivo');
    }

    const customer = result[0];

    return {
      sub: Number(customer.id),
      email: customer.email,
      type: 'customer' as const,
    };
  }
}

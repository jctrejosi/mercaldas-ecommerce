import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy as PassportLocalStrategy,
  IStrategyOptions,
} from 'passport-local';
import { CustomerAuthService } from '../customer-auth.service';

const LocalPassportStrategy = PassportLocalStrategy as unknown as new (
  options: IStrategyOptions,
  verify?: (...args: unknown[]) => unknown,
) => unknown;

@Injectable()
export class CustomerLocalStrategy extends PassportStrategy(
  LocalPassportStrategy,
  'customer-local',
) {
  constructor(private readonly customerAuthService: CustomerAuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const customer = await this.customerAuthService.validateCustomer(
      email,
      password,
    );

    if (!customer) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return customer;
  }
}

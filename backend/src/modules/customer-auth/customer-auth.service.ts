import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../database/drizzle.service';
import {
  customers,
  customerRefreshTokens,
} from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { CustomerSocialLoginDto } from './dto/customer-social-login.dto';
import * as bcrypt from 'bcryptjs';

interface GoogleTokenInfoResponse {
  azp?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string;
}

interface GoogleUserInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface CustomerJwtPayload {
  sub: number;
  email: string;
  type: 'customer';
}

export interface CustomerAuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  customer: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
    phone: string | null;
    isVerified: boolean;
    isActive: boolean;
    provider: string | null;
    avatarUrl: string | null;
  };
}

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get db() {
    return this.drizzle.db;
  }

  private get jwtSecret(): string {
    return (
      this.configService.get<string>('CUSTOMER_JWT_SECRET') ||
      this.configService.get<string>('jwt.secret') ||
      'secret-key'
    );
  }

  async validateCustomer(
    email: string,
    password: string,
  ): Promise<typeof customers.$inferSelect | null> {
    const results = await this.db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (!results.length) {
      this.logger.warn(
        `Intento de login fallido: cliente "${email}" no encontrado`,
      );
      return null;
    }

    const customer = results[0];

    if (!customer.isActive) {
      this.logger.warn(
        `Intento de login fallido: cliente "${email}" inactivo`,
      );
      return null;
    }

    if (!customer.passwordHash) {
      this.logger.warn(
        `Intento de login fallido: cliente "${email}" sin contraseña local`,
      );
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      customer.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        `Intento de login fallido: contraseña incorrecta para "${email}"`,
      );
      return null;
    }

    await this.db
      .update(customers)
      .set({
        lastLoginAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      })
      .where(eq(customers.id, customer.id));

    return customer;
  }

  async register(
    registerDto: CustomerRegisterDto,
  ): Promise<CustomerAuthResponse> {
    if (!registerDto.acceptsTerms) {
      throw new BadRequestException(
        'Debe aceptar los términos y condiciones para registrarse',
      );
    }

    const existing = await this.db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.email, registerDto.email))
      .limit(1);

    if (existing.length) {
      throw new ConflictException('Ya existe un cliente con este email');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const inserted = await this.db
      .insert(customers)
      .values({
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        documentNumber: registerDto.documentNumber,
        documentType: registerDto.documentType,
        acceptsMarketing: registerDto.acceptsMarketing ?? false,
        acceptsTermsAt: new Date().toISOString(),
        provider: 'local',
        customerType: 'registered',
        isVerified: false,
        isActive: true,
      })
      .returning();

    const customer = inserted[0];
    return this.buildAuthResponse(customer);
  }

  async login(loginDto: CustomerLoginDto): Promise<CustomerAuthResponse> {
    const customer = await this.validateCustomer(
      loginDto.email,
      loginDto.password,
    );

    if (!customer) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(customer);
  }

  async socialLogin(
    socialLoginDto: CustomerSocialLoginDto,
  ): Promise<CustomerAuthResponse> {
    const validatedProfile = await this.validateSocialProfile(socialLoginDto);
    const { provider } = socialLoginDto;
    const { providerId, email, name, firstName, lastName, avatarUrl } =
      validatedProfile;

    let customer: typeof customers.$inferSelect | undefined;

    if (providerId) {
      const byProvider = await this.db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.provider, provider),
            eq(customers.providerId, providerId),
          ),
        )
        .limit(1);

      if (byProvider.length) {
        customer = byProvider[0];
      }
    }

    if (!customer && email) {
      const byEmail = await this.db
        .select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(1);

      if (byEmail.length) {
        customer = byEmail[0];

        await this.db
          .update(customers)
          .set({
            provider,
            providerId: providerId ?? customer.providerId,
            firstName: firstName ?? customer.firstName,
            lastName: lastName ?? customer.lastName,
            avatarUrl: avatarUrl ?? customer.avatarUrl,
            emailVerified: true,
            isVerified: true,
            lastLoginAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
          })
          .where(eq(customers.id, customer.id));
      }
    }

    if (!customer) {
      if (!email) {
        throw new BadRequestException(
          'El email es obligatorio para registrar un nuevo cliente social',
        );
      }

      const normalizedName = this.extractCustomerName({
        name,
        firstName,
        lastName,
      });

      const inserted = await this.db
        .insert(customers)
        .values({
          email,
          firstName: normalizedName.firstName,
          lastName: normalizedName.lastName,
          provider,
          providerId: providerId ?? null,
          avatarUrl: avatarUrl ?? null,
          emailVerified: true,
          customerType: 'registered',
          isVerified: true,
          isActive: true,
          acceptsTermsAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        })
        .returning();

      customer = inserted[0];
    } else {
      if (!customer.isActive) {
        throw new UnauthorizedException('Cliente inactivo');
      }

      await this.db
        .update(customers)
        .set({
          lastLoginAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        })
        .where(eq(customers.id, customer.id));
    }

    return this.buildAuthResponse(customer);
  }

  private async validateSocialProfile(
    socialLoginDto: CustomerSocialLoginDto,
  ): Promise<{
    providerId?: string;
    email?: string;
    name?: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string;
  }> {
    if (socialLoginDto.provider === 'google') {
      return this.validateGoogleAccessToken(socialLoginDto.accessToken);
    }

    const fallbackName = this.extractCustomerName({
      name: socialLoginDto.name,
    });

    return {
      providerId: socialLoginDto.providerId,
      email: socialLoginDto.email,
      name: socialLoginDto.name,
      firstName: fallbackName.firstName,
      lastName: fallbackName.lastName,
      avatarUrl: socialLoginDto.avatarUrl,
    };
  }

  private async validateGoogleAccessToken(
    accessToken: string,
  ): Promise<{
    providerId?: string;
    email?: string;
    name?: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string;
  }> {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!googleClientId) {
      throw new UnauthorizedException(
        'Google login no está configurado en el servidor',
      );
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
    );

    if (!response.ok) {
      this.logger.warn('Google token validation failed');
      throw new UnauthorizedException('Token de Google inválido');
    }

    const tokenInfo = (await response.json()) as GoogleTokenInfoResponse;
    const audience = tokenInfo.aud ?? tokenInfo.azp;

    if (!audience || audience !== googleClientId) {
      this.logger.warn(
        `Google token audience mismatch: ${audience ?? 'unknown'}`,
      );
      throw new UnauthorizedException('Token de Google inválido para este cliente');
    }

    if (!tokenInfo.email) {
      throw new BadRequestException(
        'Google no devolvió un email para este usuario',
      );
    }

    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const userInfo = userInfoResponse.ok
      ? ((await userInfoResponse.json()) as GoogleUserInfoResponse)
      : undefined;

    const normalizedName = this.extractCustomerName({
      name: userInfo?.name,
      firstName: userInfo?.given_name,
      lastName: userInfo?.family_name,
    });

    return {
      providerId: userInfo?.sub ?? tokenInfo.sub,
      email: userInfo?.email ?? tokenInfo.email,
      name: userInfo?.name,
      firstName: normalizedName.firstName,
      lastName: normalizedName.lastName,
      avatarUrl: userInfo?.picture,
    };
  }

  private extractCustomerName({
    name,
    firstName,
    lastName,
  }: {
    name?: string;
    firstName?: string | null;
    lastName?: string | null;
  }): {
    firstName: string | null;
    lastName: string | null;
  } {
    const normalizedFirstName = firstName?.trim() || null;
    const normalizedLastName = lastName?.trim() || null;

    if (normalizedFirstName || normalizedLastName) {
      return {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
      };
    }

    const parts = (name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return {
        firstName: null,
        lastName: null,
      };
    }

    return {
      firstName: parts[0] ?? null,
      lastName: parts.slice(1).join(' ') || null,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const storedTokens = await this.db
      .select()
      .from(customerRefreshTokens)
      .where(eq(customerRefreshTokens.token, refreshToken))
      .limit(1);

    if (!storedTokens.length) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const storedToken = storedTokens[0];

    if (storedToken.revoked) {
      throw new UnauthorizedException('Refresh token revocado');
    }

    if (new Date(storedToken.expiresAt) < new Date()) {
      await this.db
        .delete(customerRefreshTokens)
        .where(eq(customerRefreshTokens.id, storedToken.id));
      throw new UnauthorizedException('Refresh token expirado');
    }

    const payload = this.jwtService.verify<CustomerJwtPayload>(refreshToken, {
      secret: this.jwtSecret,
    });

    if (payload.type !== 'customer') {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const customerResults = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, BigInt(payload.sub)))
      .limit(1);

    if (!customerResults.length || !customerResults[0].isActive) {
      await this.db
        .update(customerRefreshTokens)
        .set({ revoked: true })
        .where(eq(customerRefreshTokens.customerId, payload.sub));
      throw new UnauthorizedException('Cliente no válido');
    }

    const customer = customerResults[0];
    const newPayload: CustomerJwtPayload = {
      sub: Number(customer.id),
      email: customer.email,
      type: 'customer',
    };

    return {
      accessToken: this.jwtService.sign(newPayload),
      expiresIn: this.getJwtExpiration(),
    };
  }

  async getProfile(customerId: number) {
    const results = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, BigInt(customerId)))
      .limit(1);

    if (!results.length) {
      throw new NotFoundException(
        `Cliente con ID ${customerId} no encontrado`,
      );
    }

    const customer = results[0];

    return {
      id: Number(customer.id),
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: this.buildFullName(customer.firstName, customer.lastName),
      phone: customer.phone,
      documentNumber: customer.documentNumber,
      documentType: customer.documentType,
      isVerified: customer.isVerified,
      isActive: customer.isActive,
      provider: customer.provider,
      avatarUrl: customer.avatarUrl,
      acceptsMarketing: customer.acceptsMarketing,
      lastLoginAt: customer.lastLoginAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async logout(
    customerId: number,
    refreshTokenString?: string,
  ): Promise<{ success: boolean; message: string }> {
    if (refreshTokenString) {
      await this.db
        .update(customerRefreshTokens)
        .set({ revoked: true })
        .where(
          and(
            eq(customerRefreshTokens.token, refreshTokenString),
            eq(customerRefreshTokens.customerId, customerId),
          ),
        );
    } else {
      await this.db
        .update(customerRefreshTokens)
        .set({ revoked: true })
        .where(eq(customerRefreshTokens.customerId, customerId));
    }

    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
    };
  }

  private async buildAuthResponse(
    customer: typeof customers.$inferSelect,
  ): Promise<CustomerAuthResponse> {
    const payload: CustomerJwtPayload = {
      sub: Number(customer.id),
      email: customer.email,
      type: 'customer',
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshTokenString = this.generateRefreshToken(payload);

    const expiresAt = new Date(
      Date.now() +
        this.parseDurationToSeconds(
          this.configService.get<string>('CUSTOMER_JWT_REFRESH_EXPIRES_IN') ??
            this.configService.get<string>('jwt.refreshExpiresIn') ??
            '30d',
        ) *
          1000,
    );

    await this.db.insert(customerRefreshTokens).values({
      customerId: Number(customer.id),
      token: refreshTokenString,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: this.getJwtExpiration(),
      customer: {
        id: Number(customer.id),
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        fullName: this.buildFullName(customer.firstName, customer.lastName),
        phone: customer.phone,
        isVerified: customer.isVerified,
        isActive: customer.isActive,
        provider: customer.provider,
        avatarUrl: customer.avatarUrl,
      },
    };
  }

  private buildFullName(
    firstName: string | null,
    lastName: string | null,
  ): string {
    return (
      [firstName, lastName].filter(Boolean).join(' ').trim() || 'Cliente'
    );
  }

  private generateRefreshToken(payload: CustomerJwtPayload): string {
    const refreshExpiresIn =
      this.configService.get<string>('CUSTOMER_JWT_REFRESH_EXPIRES_IN') ??
      this.configService.get<string>('jwt.refreshExpiresIn') ??
      '30d';

    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.parseDurationToSeconds(refreshExpiresIn),
    });
  }

  private getJwtExpiration(): number {
    const expiresIn =
      this.configService.get<string>('CUSTOMER_JWT_EXPIRES_IN') ??
      this.configService.get<string>('jwt.expiresIn') ??
      '7d';

    return this.parseDurationToSeconds(expiresIn);
  }

  private parseDurationToSeconds(duration: string): number {
    const value = parseInt(duration, 10);
    const unit = duration.replace(/[0-9]/g, '');

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 604800;
    }
  }
}

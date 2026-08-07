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
  customerAddresses,
  customerPaymentMethods,
  newsletterSubscribers,
  settings,
} from '../../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
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
    acceptsMarketing: boolean;
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

    // Si aceptó marketing en el registro, crearlo como suscriptor del newsletter
    if (registerDto.acceptsMarketing) {
      await this.syncNewsletterSubscription(
        Number(customer.id),
        customer.email,
        true,
        customer.firstName ?? undefined,
        customer.lastName ?? undefined,
      );
    }

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

  async updateProfile(
    customerId: number,
    body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      password?: string;
      acceptsMarketing?: boolean;
    },
  ) {
    const setData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.firstName !== undefined) setData.firstName = body.firstName;
    if (body.lastName !== undefined) setData.lastName = body.lastName;
    if (body.phone !== undefined) setData.phone = body.phone;
    if (body.email !== undefined) setData.email = body.email;
    if (body.acceptsMarketing !== undefined) setData.acceptsMarketing = body.acceptsMarketing;
    if (body.password) {
      const salt = await bcrypt.genSalt(12);
      setData.passwordHash = await bcrypt.hash(body.password, salt);
    }

    await this.db
      .update(customers)
      .set(setData)
      .where(eq(customers.id, BigInt(customerId)));

    // Sincronizar preferencia de marketing con la suscripción al newsletter:
    // si acceptsMarketing es true el cliente debe figurar como suscriptor activo,
    // si es false debe quedar dado de baja de los suscriptores.
    if (body.acceptsMarketing !== undefined) {
      await this.syncNewsletterSubscription(
        customerId,
        body.email,
        body.acceptsMarketing,
        body.firstName,
        body.lastName,
      );
    }

    return await this.getProfile(customerId);
  }

  /**
   * Mantiene consistencia entre customers.acceptsMarketing y la tabla
   * newsletter_subscribers (mismo correo).
   */
  private async syncNewsletterSubscription(
    customerId: number,
    emailOverride: string | undefined,
    acceptsMarketing: boolean,
    firstName?: string,
    lastName?: string,
  ) {
    const [customer] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, BigInt(customerId)))
      .limit(1);

    if (!customer) return;

    const email = (emailOverride ?? customer.email).toLowerCase().trim();
    const name = [firstName ?? customer.firstName, lastName ?? customer.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || null;

    const existing = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);

    if (acceptsMarketing) {
      if (existing.length) {
        // Reactivar si estaba inactivo o eliminado
        const sub = existing[0];
        if (!sub.isActive || sub.deletedAt) {
          await this.db
            .update(newsletterSubscribers)
            .set({
              isActive: true,
              name: name ?? sub.name,
              acceptedTerms: true,
              unsubscribedAt: null,
              deletedAt: null,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(newsletterSubscribers.id, sub.id));
        } else if (name && name !== sub.name) {
          await this.db
            .update(newsletterSubscribers)
            .set({ name, updatedAt: new Date().toISOString() })
            .where(eq(newsletterSubscribers.id, sub.id));
        }
      } else {
        await this.db.insert(newsletterSubscribers).values({
          email,
          name,
          acceptedTerms: true,
          isActive: true,
        });
      }
    } else {
      if (existing.length) {
        await this.db
          .update(newsletterSubscribers)
          .set({
            isActive: false,
            unsubscribedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(newsletterSubscribers.id, existing[0].id));
      }
    }
  }

  async deleteAccount(customerId: number): Promise<{ success: boolean; message: string }> {
    // Quitar del newsletter para no seguir enviándole promociones
    await this.syncNewsletterSubscription(customerId, undefined, false);

    await this.db
      .update(customers)
      .set({
        isActive: false,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(customers.id, BigInt(customerId)));

    return { success: true, message: 'Cuenta eliminada exitosamente' };
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
        acceptsMarketing: customer.acceptsMarketing,
      },
    };
  }

  // ── Customer Addresses ──

  async getAddresses(customerId: number) {
    const rows = await this.db
      .select({
        id: customerAddresses.id,
        alias: customerAddresses.alias,
        addressLine1: customerAddresses.addressLine1,
        addressLine2: customerAddresses.addressLine2,
        city: customerAddresses.city,
        state: customerAddresses.state,
        country: customerAddresses.country,
        deliveryInstructions: customerAddresses.deliveryInstructions,
        reference: customerAddresses.reference,
        isDefault: customerAddresses.isDefault,
        createdAt: customerAddresses.createdAt,
      })
      .from(customerAddresses)
      .where(
        and(
          eq(customerAddresses.customerId, customerId),
          sql`${customerAddresses.deletedAt} IS NULL`,
        ),
      )
      .orderBy(desc(customerAddresses.isDefault), desc(customerAddresses.createdAt));

    return rows.map((row) => ({
      id: Number(row.id),
      alias: row.alias,
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2,
      city: row.city,
      state: row.state,
      country: row.country,
      deliveryInstructions: row.deliveryInstructions,
      reference: row.reference,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
    }));
  }

  async createAddress(
    customerId: number,
    dto: {
      alias?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      reference?: string;
      deliveryInstructions?: string;
      isDefault?: boolean;
    },
  ) {
    // If setting as default, unset any existing default
    if (dto.isDefault) {
      await this.db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customerId));
    }

    const [inserted] = await this.db
      .insert(customerAddresses)
      .values({
        customerId,
        alias: dto.alias ?? null,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city,
        reference: dto.reference ?? null,
        deliveryInstructions: dto.deliveryInstructions ?? null,
        isDefault: dto.isDefault ?? false,
      })
      .returning({ id: customerAddresses.id });

    return { id: Number(inserted.id) };
  }

  async updateAddress(
    customerId: number,
    addressId: number,
    dto: {
      alias?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      reference?: string;
      deliveryInstructions?: string;
      isDefault?: boolean;
    },
  ) {
    // Verify ownership
    const [existing] = await this.db
      .select({ id: customerAddresses.id })
      .from(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, BigInt(addressId)),
        eq(customerAddresses.customerId, customerId),
      ),
    );

    if (!existing) throw new NotFoundException('Dirección no encontrada');

    // If setting as default, unset any existing default
    if (dto.isDefault) {
      await this.db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customerId));
    }

    await this.db
      .update(customerAddresses)
      .set({
        ...(dto.alias !== undefined && { alias: dto.alias }),
        ...(dto.addressLine1 !== undefined && {
          addressLine1: dto.addressLine1,
        }),
        ...(dto.addressLine2 !== undefined && {
          addressLine2: dto.addressLine2,
        }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.reference !== undefined && { reference: dto.reference }),
        ...(dto.deliveryInstructions !== undefined && {
          deliveryInstructions: dto.deliveryInstructions,
        }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(customerAddresses.id, BigInt(addressId)));

    return { id: addressId };
  }

  async deleteAddress(customerId: number, addressId: number) {
    const [existing] = await this.db
      .select({ id: customerAddresses.id })
      .from(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, BigInt(addressId)),
          eq(customerAddresses.customerId, customerId),
        ),
      );

    if (!existing) throw new NotFoundException('Dirección no encontrada');

    await this.db
      .update(customerAddresses)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(customerAddresses.id, BigInt(addressId)));

    return { success: true };
  }

  async setDefaultAddress(customerId: number, addressId: number) {
    // Verify ownership
    const [existing] = await this.db
      .select({ id: customerAddresses.id })
      .from(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, BigInt(addressId)),
          eq(customerAddresses.customerId, customerId),
        ),
      );

    if (!existing) throw new NotFoundException('Dirección no encontrada');

    // Unset all defaults for this customer
    await this.db
      .update(customerAddresses)
      .set({ isDefault: false })
      .where(eq(customerAddresses.customerId, customerId));

    // Set this one as default
    await this.db
      .update(customerAddresses)
      .set({ isDefault: true })
      .where(eq(customerAddresses.id, BigInt(addressId)));

    return { success: true };
  }

  // ── Customer Payment Methods ──

  /**
   * Lee la configuración de medios de pago del admin
   * (settings key 'payment_methods') y devuelve qué métodos
   * están habilitados para los clientes.
   */
  private async getPaymentMethodsConfig() {
    const [row] = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'payment_methods'))
      .limit(1);

    const defaults = {
      efectivo: { enabled: true },
      wompi: {
        enabled: true,
        methods: { card: true, pse: true, nequi: true },
      },
      breb: { enabled: true },
    };

    if (!row) return defaults;
    const value = row.value as any;
    return {
      efectivo: { enabled: value?.efectivo?.enabled ?? true },
      wompi: {
        enabled: value?.wompi?.enabled ?? true,
        methods: {
          card: value?.wompi?.methods?.card ?? true,
          pse: value?.wompi?.methods?.pse ?? true,
          nequi: value?.wompi?.methods?.nequi ?? true,
        },
      },
      breb: { enabled: value?.breb?.enabled ?? true },
    };
  }

  private getEnabledMethodTypes(config: Awaited<ReturnType<CustomerAuthService['getPaymentMethodsConfig']>>) {
    const types: Array<'CARD' | 'NEQUI'> = [];
    if (config.wompi.enabled && config.wompi.methods.card) types.push('CARD');
    if (config.wompi.enabled && config.wompi.methods.nequi) types.push('NEQUI');
    return types;
  }

  async getPaymentMethods(customerId: number) {
    const rows = await this.db
      .select()
      .from(customerPaymentMethods)
      .where(
        and(
          eq(customerPaymentMethods.customerId, customerId),
          sql`${customerPaymentMethods.deletedAt} IS NULL`,
        ),
      )
      .orderBy(
        desc(customerPaymentMethods.isDefault),
        desc(customerPaymentMethods.createdAt),
      );

    return rows.map((row) => ({
      id: Number(row.id),
      methodType: row.methodType,
      label: row.label,
      brand: row.brand,
      last4: row.last4,
      cardholderName: row.cardholderName,
      phone: row.phone,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
    }));
  }

  async createPaymentMethod(
    customerId: number,
    dto: {
      methodType: 'CARD' | 'NEQUI';
      label?: string;
      brand?: string;
      last4?: string;
      cardholderName?: string;
      token?: string;
      phone?: string;
      isDefault?: boolean;
    },
  ) {
    const config = await this.getPaymentMethodsConfig();
    const enabledTypes = this.getEnabledMethodTypes(config);

    if (!enabledTypes.includes(dto.methodType)) {
      throw new BadRequestException(
        'Este medio de pago no está habilitado por la tienda',
      );
    }

    if (dto.methodType === 'CARD') {
      if (!dto.token || !dto.last4 || !dto.brand) {
        throw new BadRequestException(
          'Faltan datos de la tarjeta (token, últimos 4 dígitos o marca)',
        );
      }
    }

    if (dto.methodType === 'NEQUI') {
      if (!dto.phone) {
        throw new BadRequestException('El número de Nequi es obligatorio');
      }
    }

    if (dto.isDefault) {
      await this.db
        .update(customerPaymentMethods)
        .set({ isDefault: false })
        .where(eq(customerPaymentMethods.customerId, customerId));
    }

    const [inserted] = await this.db
      .insert(customerPaymentMethods)
      .values({
        customerId,
        methodType: dto.methodType,
        label: dto.label ?? null,
        brand: dto.brand ?? null,
        last4: dto.last4 ?? null,
        cardholderName: dto.cardholderName ?? null,
        token: dto.token ?? null,
        phone: dto.phone ?? null,
        isDefault: dto.isDefault ?? false,
      })
      .returning({ id: customerPaymentMethods.id });

    return { id: Number(inserted.id) };
  }

  async updatePaymentMethod(
    customerId: number,
    paymentMethodId: number,
    dto: {
      label?: string;
      brand?: string;
      last4?: string;
      cardholderName?: string;
      token?: string;
      phone?: string;
      isDefault?: boolean;
    },
  ) {
    const [existing] = await this.db
      .select({ id: customerPaymentMethods.id })
      .from(customerPaymentMethods)
      .where(
        and(
          eq(customerPaymentMethods.id, BigInt(paymentMethodId)),
          eq(customerPaymentMethods.customerId, customerId),
        ),
      );

    if (!existing) throw new NotFoundException('Método de pago no encontrado');

    if (dto.isDefault) {
      await this.db
        .update(customerPaymentMethods)
        .set({ isDefault: false })
        .where(eq(customerPaymentMethods.customerId, customerId));
    }

    await this.db
      .update(customerPaymentMethods)
      .set({
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.last4 !== undefined && { last4: dto.last4 }),
        ...(dto.cardholderName !== undefined && {
          cardholderName: dto.cardholderName,
        }),
        ...(dto.token !== undefined && { token: dto.token }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(customerPaymentMethods.id, BigInt(paymentMethodId)));

    return { id: paymentMethodId };
  }

  async deletePaymentMethod(customerId: number, paymentMethodId: number) {
    const [existing] = await this.db
      .select({ id: customerPaymentMethods.id })
      .from(customerPaymentMethods)
      .where(
        and(
          eq(customerPaymentMethods.id, BigInt(paymentMethodId)),
          eq(customerPaymentMethods.customerId, customerId),
        ),
      );

    if (!existing) throw new NotFoundException('Método de pago no encontrado');

    await this.db
      .update(customerPaymentMethods)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(customerPaymentMethods.id, BigInt(paymentMethodId)));

    return { success: true };
  }

  async setDefaultPaymentMethod(customerId: number, paymentMethodId: number) {
    const [existing] = await this.db
      .select({ id: customerPaymentMethods.id })
      .from(customerPaymentMethods)
      .where(
        and(
          eq(customerPaymentMethods.id, BigInt(paymentMethodId)),
          eq(customerPaymentMethods.customerId, customerId),
        ),
      );

    if (!existing) throw new NotFoundException('Método de pago no encontrado');

    await this.db
      .update(customerPaymentMethods)
      .set({ isDefault: false })
      .where(eq(customerPaymentMethods.customerId, customerId));

    await this.db
      .update(customerPaymentMethods)
      .set({ isDefault: true })
      .where(eq(customerPaymentMethods.id, BigInt(paymentMethodId)));

    return { success: true };
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

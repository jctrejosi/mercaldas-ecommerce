import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../database/drizzle.service';
import { users, userRefreshTokens } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcryptjs';

export interface JwtPayload {
  sub: number; // users.id
  email: string;
  isSuperuser: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
    isSuperuser: boolean;
    isActive: boolean;
    phone?: string | null;
  };
}

type UserUpdateData = {
  failedAttempts: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 15;

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get db() {
    return this.drizzle.db;
  }

  /**
   * Validar usuario por email y password con bloqueo por intentos fallidos
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<typeof users.$inferSelect | null> {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!results.length) {
      this.logger.warn(
        `Intento de login fallido: usuario "${email}" no encontrado`,
      );
      return null;
    }

    const user = results[0];

    if (!user.isActive) {
      this.logger.warn(`Intento de login fallido: usuario "${email}" inactivo`);
      return null;
    }

    if (!user.passwordHash) {
      this.logger.warn(
        `Intento de login fallido: usuario "${email}" sin hash de contraseña`,
      );
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(
        `Intento de login fallido: contraseña incorrecta para "${email}"`,
      );

      return null;
    }

    // Resetear intentos fallidos y actualizar último login
    await this.db
      .update(users)
      .set({
        lastLoginAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.id));

    return user;
  }

  /**
   * Login con email y password
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: Number(user.id),
      email: user.email,
      isSuperuser: user.isSuperuser,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshTokenString = this.generateRefreshToken(payload);

    // Guardar refresh token en BD (si usas tabla de refresh tokens)
    const expiresAt = new Date(
      Date.now() +
        this.parseDurationToSeconds(
          this.configService.get<string>('app.jwt.refreshExpiresIn') ?? '30d',
        ) *
          1000,
    );

    await this.db.insert(userRefreshTokens).values({
      userId: Number(user.id),
      token: refreshTokenString,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: this.getJwtExpiration(),
      user: {
        id: Number(user.id),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
        isSuperuser: user.isSuperuser,
        isActive: user.isActive,
        phone: user.phone,
      },
    } as LoginResponse;
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const jwtSecret = this.configService.get<string>('app.jwt.secret');

      if (!jwtSecret) {
        this.logger.error('JWT secret no configurado');
        throw new UnauthorizedException('Configuración inválida');
      }

      const tokenString = refreshTokenDto.refreshToken;

      if (!tokenString) {
        this.logger.warn('Refresh token no provisto');
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }

      // Verificar en BD que existe, no está revocado y no expiró
      const storedTokens = await this.db
        .select()
        .from(userRefreshTokens)
        .where(eq(userRefreshTokens.token, tokenString))
        .limit(1);

      if (!storedTokens.length) {
        this.logger.warn('Refresh token no encontrado en BD');
        throw new UnauthorizedException('Refresh token inválido');
      }

      const storedToken = storedTokens[0];

      if (storedToken.revoked) {
        this.logger.warn(
          `Refresh token revocado para user ID ${storedToken.userId}`,
        );
        throw new UnauthorizedException('Refresh token revocado');
      }

      if (new Date(storedToken.expiresAt) < new Date()) {
        this.logger.warn(
          `Refresh token expirado para user ID ${storedToken.userId}`,
        );
        await this.db
          .delete(userRefreshTokens)
          .where(eq(userRefreshTokens.id, storedToken.id));
        throw new UnauthorizedException('Refresh token expirado');
      }

      // Validar payload del token
      const payload = this.jwtService.verify<JwtPayload>(tokenString, {
        secret: jwtSecret,
      });

      // Verificar que el usuario existe y está activo
      const userResults = await this.db
        .select()
        .from(users)
        .where(eq(users.id, BigInt(payload.sub)))
        .limit(1);

      if (!userResults.length || !userResults[0].isActive) {
        this.logger.warn(`Usuario ${payload.sub} no válido o inactivo`);
        await this.db
          .update(userRefreshTokens)
          .set({ revoked: true })
          .where(eq(userRefreshTokens.userId, payload.sub));
        throw new UnauthorizedException('Usuario no válido');
      }

      const user = userResults[0];

      // Generar nuevo access token
      const newPayload: JwtPayload = {
        sub: Number(user.id),
        email: user.email,
        isSuperuser: user.isSuperuser,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
        expiresIn: this.getJwtExpiration(),
      };
    } catch (error) {
      this.logger.error(
        `Error al refrescar token: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /**
   * Obtiene el perfil completo del usuario autenticado
   */
  async getProfile(userId: number) {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.id, BigInt(userId)))
      .limit(1);

    if (!results.length) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const user = results[0];
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

    return {
      id: Number(user.id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: fullName || 'Usuario',
      phone: user.phone,
      isSuperuser: user.isSuperuser,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Cierra la sesión (logout) y revoca el refresh token
   */
  async logout(
    userId: number,
    refreshTokenString?: string,
  ): Promise<{ success: boolean; message: string }> {
    if (refreshTokenString) {
      // Revocar solo el token específico
      const result = await this.db
        .update(userRefreshTokens)
        .set({ revoked: true })
        .where(
          and(
            eq(userRefreshTokens.token, refreshTokenString),
            eq(userRefreshTokens.userId, userId),
          ),
        );

      if (result.rowCount === 0) {
        this.logger.warn(
          `Intento de logout con token inválido para user ${userId}`,
        );
      } else {
        this.logger.log(`Refresh token revocado para user ID ${userId}`);
      }
    } else {
      // Revocar todos los tokens del usuario
      await this.db
        .update(userRefreshTokens)
        .set({ revoked: true })
        .where(eq(userRefreshTokens.userId, userId));
      this.logger.log(
        `Todos los refresh tokens revocados para user ID ${userId}`,
      );
    }

    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
    };
  }

  /**
   * Genera un refresh token con expiración más larga
   */
  private generateRefreshToken(payload: JwtPayload): string {
    const refreshExpiresIn =
      this.configService.get<string>('app.jwt.refreshExpiresIn') ?? '30d';
    return this.jwtService.sign(payload, {
      expiresIn: this.parseDurationToSeconds(refreshExpiresIn),
    });
  }

  /**
   * Obtiene el tiempo de expiración del token en segundos
   */
  private getJwtExpiration(): number {
    const expiresIn =
      this.configService.get<string>('app.jwt.expiresIn') ?? '7d';
    return this.parseDurationToSeconds(expiresIn);
  }

  /**
   * Convierte una duración (ej: "7d", "1h") a segundos
   */
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
        return 604800; // 7 días por defecto
    }
  }
}

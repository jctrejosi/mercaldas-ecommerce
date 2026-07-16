/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getDb } from '../../database/drizzle';
import {
  account,
  employee,
  person,
  refreshToken,
  branch,
  department,
  position,
} from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MicrosoftLoginDto } from './dto/microsoft-login.dto';
import type { NewRefreshToken } from '../../database/schema/refresh-token.schema';
import { compare } from 'bcryptjs';

export interface JwtPayload {
  sub: number; // account.id
  username: string;
  employeeId: number;
  role?: 'admin' | 'manager' | 'employee';
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
    username: string;
    employeeId: number;
    fullName: string;
    email?: string | null;
    role?: 'admin' | 'manager' | 'employee';
    employeeCode?: string | null;
    area?: string | null;
    branch?: {
      id: number;
      name: string;
      address: string | null;
      latitude: string | null;
      longitude: string | null;
    } | null;
    department?: {
      id: number;
      name: string;
    } | null;
    position?: {
      id: number;
      name: string;
    } | null;
    photo?: string | null;
  };
}

type AccountUpdateData = {
  failedAttempts: number;
  lockedUntil?: Date | null;
  lastLogin?: Date;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 15;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get db() {
    return getDb();
  }

  /**
   * Autentica un usuario por username y password con bloqueo por intentos fallidos
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<{
    account: typeof account.$inferSelect;
    employee: typeof employee.$inferSelect;
    person: typeof person.$inferSelect;
  } | null> {
    const accounts = await this.db
      .select()
      .from(account)
      .where(eq(account.username, username))
      .limit(1);

    if (!accounts.length) {
      this.logger.warn(
        `Intento de login fallido: usuario "${username}" no encontrado`,
      );
      return null;
    }

    const userAccount = accounts[0];

    // Verificar si la cuenta está bloqueada
    if (
      userAccount.lockedUntil &&
      new Date(userAccount.lockedUntil) > new Date()
    ) {
      const remainingMinutes = Math.ceil(
        (new Date(userAccount.lockedUntil).getTime() - Date.now()) /
          (60 * 1000),
      );
      this.logger.warn(
        `Intento de login fallido: usuario "${username}" bloqueado por ${remainingMinutes} minutos`,
      );
      throw new UnauthorizedException(
        `Cuenta bloqueada temporalmente. Intente nuevamente en ${remainingMinutes} minutos.`,
      );
    }

    if (!userAccount.active) {
      this.logger.warn(
        `Intento de login fallido: usuario "${username}" inactivo`,
      );
      return null;
    }

    const passwordHash = userAccount.passwordHash;
    if (!passwordHash) {
      this.logger.warn(
        `Intento de login fallido: usuario "${username}" sin hash de contraseña`,
      );
      return null;
    }

    const isPasswordValid = await compare(password, passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(
        `Intento de login fallido: contraseña incorrecta para "${username}"`,
      );

      // Incrementar intentos fallidos
      const newAttempts = (userAccount.failedAttempts || 0) + 1;
      const updateData: AccountUpdateData = { failedAttempts: newAttempts };

      // Bloquear si supera el límite
      if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(
          Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000,
        );
        updateData.lockedUntil = lockedUntil;
        this.logger.warn(
          `Usuario "${username}" bloqueado por ${this.LOCK_DURATION_MINUTES} minutos (${newAttempts} intentos fallidos)`,
        );
        throw new UnauthorizedException(
          `Demasiados intentos fallidos. Cuenta bloqueada por ${this.LOCK_DURATION_MINUTES} minutos.`,
        );
      }

      await this.db
        .update(account)
        .set(updateData)
        .where(eq(account.id, userAccount.id));

      return null;
    }

    // Resetear intentos fallidos y actualizar último login
    await this.db
      .update(account)
      .set({
        failedAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      })
      .where(eq(account.id, userAccount.id));

    // Obtener datos del empleado y persona
    const employees = await this.db
      .select()
      .from(employee)
      .where(eq(employee.id, userAccount.employeeId))
      .limit(1);

    if (!employees.length) {
      this.logger.error(
        `Empleado no encontrado para account ID ${userAccount.id}`,
      );
      return null;
    }

    const persons = await this.db
      .select()
      .from(person)
      .where(eq(person.id, employees[0].personId))
      .limit(1);

    if (!persons.length) {
      this.logger.error(
        `Persona no encontrada para employee ID ${employees[0].id}`,
      );
      return null;
    }

    return {
      account: userAccount,
      employee: employees[0],
      person: persons[0],
    };
  }

  /**
   * Login con username y password
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const userData = await this.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!userData) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const fullName = [
      userData.person.firstName,
      userData.person.middleName,
      userData.person.lastName,
      userData.person.secondLastName,
    ]
      .filter(Boolean)
      .join(' ');

    // Obtener datos de branch, department, position
    let branchData: any = null;
    let departmentData: any = null;
    let positionData: any = null;

    if (userData.employee.branchId) {
      const branches = await this.db
        .select({
          id: branch.id,
          name: branch.name,
          address: branch.address,
          latitude: branch.latitude,
          longitude: branch.longitude,
        })
        .from(branch)
        .where(eq(branch.id, userData.employee.branchId))
        .limit(1);
      if (branches.length) {
        branchData = branches[0];
      }
    }

    if (userData.employee.departmentId) {
      const departments = await this.db
        .select({
          id: department.id,
          name: department.name,
        })
        .from(department)
        .where(eq(department.id, userData.employee.departmentId))
        .limit(1);
      if (departments.length) {
        departmentData = departments[0];
      }
    }

    if (userData.employee.positionId) {
      const positions = await this.db
        .select({
          id: position.id,
          name: position.name,
        })
        .from(position)
        .where(eq(position.id, userData.employee.positionId))
        .limit(1);
      if (positions.length) {
        positionData = positions[0];
      }
    }

    // Construir el área
    const areaParts: string[] = [];
    if (departmentData?.name) areaParts.push(departmentData.name);
    if (branchData?.name) areaParts.push(branchData.name);
    const area = areaParts.length ? areaParts.join(' — ') : 'Sin área asignada';

    const payload: JwtPayload = {
      sub: userData.account.id,
      username: userData.account.username,
      employeeId: userData.account.employeeId,
      role: userData.account.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshTokenString = this.generateRefreshToken(payload);

    // Guardar refresh token en BD
    const expiresAt = new Date(
      Date.now() +
        this.parseDurationToSeconds(
          this.configService.get<string>('app.jwt.refreshExpiresIn') ?? '30d',
        ) *
          1000,
    );

    const newRefreshToken: NewRefreshToken = {
      accountId: userData.account.id,
      token: refreshTokenString,
      expiresAt,
      revoked: false,
    };

    await this.db.insert(refreshToken).values(newRefreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: this.getJwtExpiration(),
      user: {
        id: userData.account.id,
        username: userData.account.username,
        employeeId: userData.account.employeeId,
        fullName: fullName || 'Usuario',
        email: userData.person.email,
        role: userData.account.role,
        employeeCode: userData.employee.employeeCode,
        area: area,
        branch: branchData,
        department: departmentData,
        position: positionData,
        photo: userData.person.photo,
      },
    };
  }

  /**
   * Login con Microsoft SSO
   */
  microsoftLogin(_: MicrosoftLoginDto): LoginResponse {
    void _;

    // TODO: Implementar verificación con Microsoft Graph API
    // 1. Validar el token de Microsoft
    // 2. Extraer email y datos del usuario
    // 3. Buscar o crear usuario en la base de datos

    throw new BadRequestException(
      'Microsoft SSO no está implementado aún. Por favor usa login tradicional.',
    );
  }

  /**
   * Refresca el token de acceso con validación en BD
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

      // 1. Verificar en BD que existe, no está revocado y no expiró
      const storedTokens = await this.db
        .select()
        .from(refreshToken)
        .where(eq(refreshToken.token, tokenString))
        .limit(1);

      if (!storedTokens.length) {
        this.logger.warn('Refresh token no encontrado en BD');
        throw new UnauthorizedException('Refresh token inválido');
      }

      const storedToken = storedTokens[0];

      if (storedToken.revoked) {
        this.logger.warn(
          `Refresh token revocado para account ID ${storedToken.accountId}`,
        );
        throw new UnauthorizedException('Refresh token revocado');
      }

      if (new Date(storedToken.expiresAt) < new Date()) {
        this.logger.warn(
          `Refresh token expirado para account ID ${storedToken.accountId}`,
        );
        // Eliminar token expirado
        await this.db
          .delete(refreshToken)
          .where(eq(refreshToken.id, storedToken.id));
        throw new UnauthorizedException('Refresh token expirado');
      }

      // 2. Validar el payload del token
      const payload = this.jwtService.verify<JwtPayload>(tokenString, {
        secret: jwtSecret,
      });

      // 3. Verificar que el usuario existe y está activo
      const accounts = await this.db
        .select()
        .from(account)
        .where(eq(account.id, payload.sub))
        .limit(1);

      if (!accounts.length || !accounts[0].active) {
        this.logger.warn(`Usuario ${payload.sub} no válido o inactivo`);
        // Revocar todos los tokens del usuario
        await this.db
          .update(refreshToken)
          .set({ revoked: true })
          .where(eq(refreshToken.accountId, payload.sub));
        throw new UnauthorizedException('Usuario no válido');
      }

      // 4. Generar nuevo access token
      const newPayload: JwtPayload = {
        sub: payload.sub,
        username: payload.username,
        employeeId: payload.employeeId,
        role: accounts[0].role,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
        expiresIn: this.getJwtExpiration(),
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
      this.logger.error(`Error al refrescar token: ${message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /**
   * Obtiene el perfil completo del usuario autenticado
   */
  async getProfileComplete(accountId: number): Promise<any> {
    const accounts = await this.db
      .select()
      .from(account)
      .where(eq(account.id, accountId))
      .limit(1);

    if (!accounts.length) {
      throw new NotFoundException(`Usuario con ID ${accountId} no encontrado`);
    }

    const employees = await this.db
      .select()
      .from(employee)
      .where(eq(employee.id, accounts[0].employeeId))
      .limit(1);

    if (!employees.length) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const persons = await this.db
      .select()
      .from(person)
      .where(eq(person.id, employees[0].personId))
      .limit(1);

    if (!persons.length) {
      throw new NotFoundException('Persona no encontrada');
    }

    // Obtener relaciones
    let branchData: any = null;
    let departmentData: any = null;
    let positionData: any = null;

    if (employees[0].branchId) {
      const branches = await this.db
        .select({
          id: branch.id,
          name: branch.name,
          address: branch.address,
          latitude: branch.latitude,
          longitude: branch.longitude,
        })
        .from(branch)
        .where(eq(branch.id, employees[0].branchId))
        .limit(1);
      if (branches.length) {
        branchData = branches[0];
      }
    }

    if (employees[0].departmentId) {
      const departments = await this.db
        .select({
          id: department.id,
          name: department.name,
        })
        .from(department)
        .where(eq(department.id, employees[0].departmentId))
        .limit(1);
      if (departments.length) {
        departmentData = departments[0];
      }
    }

    if (employees[0].positionId) {
      const positions = await this.db
        .select({
          id: position.id,
          name: position.name,
        })
        .from(position)
        .where(eq(position.id, employees[0].positionId))
        .limit(1);
      if (positions.length) {
        positionData = positions[0];
      }
    }

    const areaParts: string[] = [];
    if (departmentData?.name) areaParts.push(departmentData.name);
    if (branchData?.name) areaParts.push(branchData.name);
    const area = areaParts.length ? areaParts.join(' — ') : 'Sin área asignada';

    const fullName = [
      persons[0].firstName,
      persons[0].middleName,
      persons[0].lastName,
      persons[0].secondLastName,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      id: accounts[0].id,
      username: accounts[0].username,
      employeeId: accounts[0].employeeId,
      fullName: fullName || 'Usuario',
      email: persons[0].email,
      role: accounts[0].role,
      employeeCode: employees[0].employeeCode,
      area: area,
      branch: branchData,
      department: departmentData,
      position: positionData,
      photo: persons[0].photo,
      active: accounts[0].active,
    };
  }

  /**
   * Obtiene el perfil del usuario autenticado (versión legacy)
   */
  async getProfile(accountId: number): Promise<{
    account: typeof account.$inferSelect;
    employee: typeof employee.$inferSelect;
    person: typeof person.$inferSelect;
  }> {
    const accounts = await this.db
      .select()
      .from(account)
      .where(eq(account.id, accountId))
      .limit(1);

    if (!accounts.length) {
      throw new NotFoundException(`Usuario con ID ${accountId} no encontrado`);
    }

    const employees = await this.db
      .select()
      .from(employee)
      .where(eq(employee.id, accounts[0].employeeId))
      .limit(1);

    if (!employees.length) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const persons = await this.db
      .select()
      .from(person)
      .where(eq(person.id, employees[0].personId))
      .limit(1);

    if (!persons.length) {
      throw new NotFoundException('Persona no encontrada');
    }

    return {
      account: accounts[0],
      employee: employees[0],
      person: persons[0],
    };
  }

  /**
   * Cierra la sesión (logout) y revoca el refresh token
   */
  async logout(
    accountId: number,
    refreshTokenString?: string,
  ): Promise<{ success: boolean; message: string }> {
    if (refreshTokenString) {
      // Revocar solo el token específico
      const result = await this.db
        .update(refreshToken)
        .set({ revoked: true })
        .where(
          and(
            eq(refreshToken.token, refreshTokenString),
            eq(refreshToken.accountId, accountId),
          ),
        );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result[0]?.affectedRows === 0) {
        this.logger.warn(
          `Intento de logout con token inválido para account ${accountId}`,
        );
      } else {
        this.logger.log(`Refresh token revocado para account ID ${accountId}`);
      }
    } else {
      // Revocar todos los tokens del usuario (logout en todos los dispositivos)
      await this.db
        .update(refreshToken)
        .set({ revoked: true })
        .where(eq(refreshToken.accountId, accountId));
      this.logger.log(
        `Todos los refresh tokens revocados para account ID ${accountId}`,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      expiresIn: refreshExpiresIn,
    };

    return this.jwtService.sign(payload, options);
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

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MicrosoftLoginDto } from './dto/microsoft-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../interfaces/request.interface';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login con username y password
   * POST /api/auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // 👇 Establecer cookie HTTP-only con el token
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });

    // También el refresh token si quieres
    if (result.refreshToken) {
      response.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
        path: '/',
      });
    }

    return result;
  }

  /**
   * Login con Microsoft SSO
   * POST /api/auth/microsoft
   */
  @Public()
  @Post('microsoft')
  @HttpCode(HttpStatus.OK)
  microsoftLogin(@Body() microsoftDto: MicrosoftLoginDto) {
    return this.authService.microsoftLogin(microsoftDto);
  }

  /**
   * Refrescar token de acceso
   * POST /api/auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.sub);
  }

  /**
   * Cerrar sesión
   * POST /api/auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body?: { refreshToken?: string },
    @Res({ passthrough: true }) response?: Response,
  ) {
    // Limpiar cookies
    if (response) {
      response.clearCookie('access_token', { path: '/' });
      response.clearCookie('refresh_token', { path: '/' });
    }

    return this.authService.logout(user.sub, body?.refreshToken);
  }
}

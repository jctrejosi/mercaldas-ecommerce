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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { CustomerSocialLoginDto } from './dto/customer-social-login.dto';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface AuthenticatedCustomer {
  sub: number;
  email: string;
  type: 'customer';
}

@ApiTags('Customer Auth')
@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar cliente',
    description: 'Crea una cuenta de cliente con email y contraseña.',
  })
  @ApiBody({ type: CustomerRegisterDto })
  @ApiResponse({ status: 201, description: 'Registro exitoso' })
  @ApiConflictResponse({ description: 'El email ya está registrado' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  async register(
    @Body() registerDto: CustomerRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.customerAuthService.register(registerDto);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión como cliente',
    description: 'Autentica un cliente con email y contraseña.',
  })
  @ApiBody({ type: CustomerLoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(
    @Body() loginDto: CustomerLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.customerAuthService.login(loginDto);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('social-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión con proveedor social',
    description: 'Autentica o registra un cliente mediante Google o Facebook.',
  })
  @ApiBody({ type: CustomerSocialLoginDto })
  @ApiResponse({ status: 200, description: 'Login social exitoso' })
  @ApiUnauthorizedResponse({ description: 'Cliente inactivo' })
  async socialLogin(
    @Body() socialLoginDto: CustomerSocialLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.customerAuthService.socialLogin(socialLoginDto);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refrescar token de acceso del cliente',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  async refreshToken(@Body() body: { refreshToken?: string }) {
    return this.customerAuthService.refreshToken(body.refreshToken ?? '');
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Get('me')
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener perfil del cliente autenticado',
  })
  async getProfile(@CurrentUser() customer: AuthenticatedCustomer) {
    return this.customerAuthService.getProfile(customer.sub);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cerrar sesión del cliente',
  })
  async logout(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Body() body?: { refreshToken?: string },
    @Res({ passthrough: true }) response?: Response,
  ) {
    if (response) {
      response.clearCookie('customer_access_token', { path: '/' });
      response.clearCookie('customer_refresh_token', { path: '/' });
    }

    return this.customerAuthService.logout(customer.sub, body?.refreshToken);
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken?: string,
  ) {
    response.cookie('customer_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    if (refreshToken) {
      response.cookie('customer_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
  }
}

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
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
  @Put('me')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar perfil del cliente' })
  async updateProfile(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Body() body: { firstName?: string; lastName?: string; phone?: string; email?: string; password?: string; acceptsMarketing?: boolean },
  ) {
    return this.customerAuthService.updateProfile(customer.sub, body);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar cuenta (soft delete)' })
  async deleteAccount(@CurrentUser() customer: AuthenticatedCustomer) {
    return this.customerAuthService.deleteAccount(customer.sub);
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

  // ── Addresses ──

  @UseGuards(CustomerJwtAuthGuard)
  @Get('addresses')
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener direcciones del cliente' })
  async getAddresses(@CurrentUser() customer: AuthenticatedCustomer) {
    return this.customerAuthService.getAddresses(customer.sub);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear dirección' })
  async createAddress(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Body() dto: any,
  ) {
    return this.customerAuthService.createAddress(customer.sub, dto);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Put('addresses/:id')
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar dirección' })
  async updateAddress(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.customerAuthService.updateAddress(customer.sub, Number(id), dto);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Delete('addresses/:id')
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar dirección (soft delete)' })
  async deleteAddress(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Param('id') id: string,
  ) {
    return this.customerAuthService.deleteAddress(customer.sub, Number(id));
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('addresses/:id/default')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Establecer dirección como predeterminada' })
  async setDefaultAddress(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Param('id') id: string,
  ) {
    return this.customerAuthService.setDefaultAddress(customer.sub, Number(id));
  }

  // ── Payment methods (guardados por el cliente) ──

  @UseGuards(CustomerJwtAuthGuard)
  @Get('payment-methods')
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener métodos de pago guardados del cliente' })
  async getPaymentMethods(@CurrentUser() customer: AuthenticatedCustomer) {
    return this.customerAuthService.getPaymentMethods(customer.sub);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('payment-methods')
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Guardar un método de pago del cliente' })
  async createPaymentMethod(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Body()
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
    return this.customerAuthService.createPaymentMethod(customer.sub, dto);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Put('payment-methods/:id')
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar un método de pago guardado' })
  async updatePaymentMethod(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Param('id') id: string,
    @Body()
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
    return this.customerAuthService.updatePaymentMethod(
      customer.sub,
      Number(id),
      dto,
    );
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Delete('payment-methods/:id')
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar un método de pago guardado (soft delete)' })
  async deletePaymentMethod(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Param('id') id: string,
  ) {
    return this.customerAuthService.deletePaymentMethod(customer.sub, Number(id));
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('payment-methods/:id/default')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('customer_access_token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Establecer método de pago como predeterminado' })
  async setDefaultPaymentMethod(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Param('id') id: string,
  ) {
    return this.customerAuthService.setDefaultPaymentMethod(
      customer.sub,
      Number(id),
    );
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

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

interface AuthenticatedCustomer {
  sub: number;
}

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(CustomerJwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear pedido desde el checkout' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Pedido creado correctamente' })
  checkout(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.checkout(customer.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener pedidos del cliente autenticado' })
  @ApiResponse({ status: 200, description: 'Listado de pedidos del cliente' })
  getOrders(@CurrentUser() customer: AuthenticatedCustomer) {
    return this.ordersService.getOrders(customer.sub);
  }
}

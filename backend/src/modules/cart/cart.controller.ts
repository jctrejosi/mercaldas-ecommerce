import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';

interface AuthenticatedCustomer {
  sub: number;
}

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@UseGuards(CustomerJwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener carrito del cliente autenticado' })
  @ApiResponse({ status: 200, description: 'Carrito obtenido correctamente' })
  getCart(@CurrentUser() customer: AuthenticatedCustomer) {
    return this.cartService.getCart(customer.sub);
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar carrito del cliente autenticado' })
  @ApiBody({ type: UpdateCartDto })
  @ApiResponse({ status: 200, description: 'Carrito actualizado correctamente' })
  updateCart(
    @CurrentUser() customer: AuthenticatedCustomer,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCart(customer.sub, dto);
  }
}

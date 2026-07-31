import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('Admin Orders')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los pedidos (admin)' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por ID o cliente',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Límite de resultados',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset para paginación',
  })
  @ApiResponse({ status: 200, description: 'Listado de pedidos' })
  getAllOrders(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.ordersService.getAllOrders({
      status,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('unreviewed-count')
  @ApiOperation({ summary: 'Obtener conteo de pedidos sin revisar' })
  @ApiResponse({ status: 200, description: 'Conteo de pedidos no revisados' })
  getUnreviewedCount() {
    return this.ordersService.getUnreviewedCount();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un pedido (admin)' })
  @ApiResponse({ status: 200, description: 'Detalle del pedido' })
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(Number(id));
  }

  @Post(':id/reviewed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar pedido como revisado' })
  @ApiResponse({ status: 200, description: 'Pedido marcado como revisado' })
  markAsReviewed(@Param('id') id: string) {
    return this.ordersService.markAsReviewed(Number(id));
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar estado de un pedido (admin)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ordersService.updateOrderStatus(Number(id), body.status);
  }
}

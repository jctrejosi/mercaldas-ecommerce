import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Admin Customers')
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes (admin)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiResponse({ status: 200, description: 'Listado de clientes' })
  getAllCustomers(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.customersService.getAllCustomers({
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('loyalty-stats')
  @ApiOperation({ summary: 'Estadísticas de lealtad (conteo por tier)' })
  @ApiResponse({ status: 200, description: 'Conteos por nivel de lealtad' })
  getLoyaltyStats() {
    return this.customersService.getLoyaltyStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de cliente (admin)' })
  @ApiResponse({ status: 200, description: 'Detalle del cliente' })
  getCustomerById(@Param('id') id: string) {
    return this.customersService.getCustomerById(Number(id));
  }
}

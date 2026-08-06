import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Admin - Inventario')
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Listar inventario' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'stockFilter', required: false, description: 'all | low | out | normal' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('search') search?: string,
    @Query('stockFilter') stockFilter?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.inventoryService.findAll({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      search,
      stockFilter: stockFilter as any,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('branches')
  @ApiOperation({ summary: 'Estadísticas por sucursal' })
  getBranchStats() {
    return this.inventoryService.getBranchStats();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Productos con stock bajo' })
  getLowStock() {
    return this.inventoryService.getLowStock(100);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de inventario' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.getOne(Number(id));
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar inventario' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      stock?: number;
      minimumStock?: number;
      reorderPoint?: number;
      maximumStock?: number;
      targetStock?: number;
    },
  ) {
    return this.inventoryService.update(Number(id), body);
  }
}

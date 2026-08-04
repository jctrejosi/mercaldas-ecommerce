import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto, CreateDeliveryZoneDto } from './dto/branch.dto';

@ApiTags('Admin - Sucursales')
@Controller('admin/branches')
export class AdminBranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las sucursales' })
  findAll() { return this.branchesService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de sucursal' })
  findOne(@Param('id') id: string) { return this.branchesService.findOne(Number(id)); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear sucursal' })
  create(@Body() dto: CreateBranchDto) { return this.branchesService.create(dto); }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar sucursal' })
  update(@Param('id') id: string, @Body() dto: UpdateBranchDto) { return this.branchesService.update(Number(id), dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar sucursal (soft delete)' })
  remove(@Param('id') id: string) { return this.branchesService.remove(Number(id)); }

  // ── Products / Categories / Brands ──

  @Get(':id/products')
  @ApiOperation({ summary: 'Productos en inventario de la sucursal' })
  getProducts(@Param('id') id: string) { return this.branchesService.getProducts(Number(id)); }

  @Get(':id/categories')
  @ApiOperation({ summary: 'Categorías con productos en la sucursal' })
  getCategories(@Param('id') id: string) { return this.branchesService.getCategories(Number(id)); }

  @Get(':id/brands')
  @ApiOperation({ summary: 'Marcas con productos en la sucursal' })
  getBrands(@Param('id') id: string) { return this.branchesService.getBrands(Number(id)); }

  // ── Delivery Zones ──

  @Get(':id/delivery-zones')
  @ApiOperation({ summary: 'Zonas de entrega de la sucursal' })
  getDeliveryZones(@Param('id') id: string) { return this.branchesService.getDeliveryZones(Number(id)); }

  @Post(':id/delivery-zones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear zona de entrega' })
  createDeliveryZone(@Param('id') id: string, @Body() dto: CreateDeliveryZoneDto) {
    return this.branchesService.createDeliveryZone(Number(id), dto);
  }

  @Delete(':id/delivery-zones/:zoneId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar zona de entrega' })
  removeDeliveryZone(@Param('id') id: string, @Param('zoneId') zoneId: string) {
    return this.branchesService.removeDeliveryZone(Number(id), Number(zoneId));
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  QueryPromotionsDto,
} from './dto/promotion.dto';

@ApiTags('Admin - Promociones')
@Controller('admin/promotions')
export class AdminPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las promociones' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar: activo, programado, expirado, inactivo, todas',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre o código de cupón',
  })
  @ApiQuery({
    name: 'usagesToday',
    required: false,
    description: 'Solo con usos hoy (true)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Límite de resultados',
  })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset' })
  @ApiResponse({ status: 200, description: 'Listado de promociones' })
  findAll(@Query() query: QueryPromotionsDto) {
    return this.promotionsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de promociones para tarjetas del dashboard',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas agregadas' })
  getStats() {
    return this.promotionsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una promoción' })
  @ApiResponse({ status: 200, description: 'Detalle de la promoción' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(Number(id));
  }

  @Get(':id/usages')
  @ApiOperation({ summary: 'Obtener usos de una promoción' })
  @ApiQuery({ name: 'dateFilter', required: false, description: 'today | all' })
  @ApiResponse({
    status: 200,
    description: 'Listado de usos con datos del pedido y cliente',
  })
  getUsages(@Param('id') id: string, @Query('dateFilter') dateFilter?: string) {
    return this.promotionsService.getPromotionUsages(
      Number(id),
      dateFilter === 'today' ? 'today' : 'all',
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva promoción' })
  @ApiResponse({ status: 201, description: 'Promoción creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una promoción existente' })
  @ApiResponse({ status: 200, description: 'Promoción actualizada' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionsService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una promoción (soft delete)' })
  @ApiResponse({ status: 200, description: 'Promoción eliminada' })
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(Number(id));
  }
}

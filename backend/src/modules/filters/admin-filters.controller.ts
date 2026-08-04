import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FiltersService } from './filters.service';
import { CreateFilterDto, UpdateFilterDto } from './dto/filter.dto';

@ApiTags('Admin - Filtros')
@Controller('admin/filters')
export class AdminFiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar filtros guardados' })
  findAll() { return this.filtersService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un filtro' })
  findOne(@Param('id') id: string) { return this.filtersService.findOne(Number(id)); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear filtro' })
  create(@Body() dto: CreateFilterDto) { return this.filtersService.create(dto); }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar filtro' })
  update(@Param('id') id: string, @Body() dto: UpdateFilterDto) { return this.filtersService.update(Number(id), dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar filtro' })
  remove(@Param('id') id: string) { return this.filtersService.remove(Number(id)); }
}

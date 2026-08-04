import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { FiltersService } from './filters.service';

@ApiTags('Filtros Públicos')
@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener configuración de un filtro (público)' })
  findOne(@Param('id') id: string) { return this.filtersService.findOne(Number(id)); }
}

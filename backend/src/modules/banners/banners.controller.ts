import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { BannersService } from './banners.service';
import { QueryBannersDto } from './dto/banner.dto';

@ApiTags('Banners Públicos')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar banners activos (público)' })
  @ApiQuery({ name: 'bannerType', required: false, description: 'hero, promo, sidebar, footer' })
  @ApiResponse({ status: 200, description: 'Listado de banners activos' })
  findAll(@Query() query: QueryBannersDto) {
    // Only return active banners for public consumption
    return this.bannersService
      .findAll(query)
      .then((banners) => banners.filter((b) => b.status === 'activo'));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un banner (público)' })
  @ApiResponse({ status: 200, description: 'Detalle del banner' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(Number(id));
  }

  @Public()
  @Post(':id/click')
  @ApiOperation({ summary: 'Registrar clic en un banner' })
  @ApiResponse({ status: 200, description: 'Clic registrado' })
  recordClick(@Param('id') id: string) {
    return this.bannersService.recordClick(Number(id));
  }

  @Public()
  @Post(':id/view')
  @ApiOperation({ summary: 'Registrar vista de un banner' })
  @ApiResponse({ status: 200, description: 'Vista registrada' })
  recordView(@Param('id') id: string) {
    return this.bannersService.recordView(Number(id));
  }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { LandingService } from './landing.service';

@ApiTags('Admin - Landing')
@Controller('admin/landing')
export class AdminLandingController {
  constructor(private readonly landingService: LandingService) {}

  @Get('product-types')
  @ApiOperation({ summary: 'Obtener tipos de producto con selección' })
  findAll() { return this.landingService.getProductTypes(); }

  @Put('product-types')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar tipos de producto seleccionados' })
  update(@Body() body: { codes: string[] }) { return this.landingService.updateProductTypes(body.codes); }
}

@ApiTags('Landing')
@Controller('landing')
export class LandingPublicController {
  constructor(private readonly landingService: LandingService) {}

  @Public()
  @Get('product-types')
  @ApiOperation({ summary: 'Tipos de producto destacados para la landing' })
  getFeatured() { return this.landingService.getFeaturedProductTypes(); }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { LandingService } from './landing.service';

@ApiTags('Admin - Landing')
@Controller('admin/landing')
export class AdminLandingController {
  constructor(private readonly landingService: LandingService) {}

  @Get('product-types')
  @ApiOperation({ summary: 'Obtener tipos de producto con selección y estado' })
  findAll() { return this.landingService.getProductTypes(); }

  @Put('product-types')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar tipos de producto seleccionados para la landing' })
  update(@Body() body: { codes: string[] }) { return this.landingService.updateProductTypes(body.codes); }

  @Patch('product-types/:id/active')
  @ApiOperation({ summary: 'Activar/desactivar un tipo de producto' })
  toggleActive(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.landingService.toggleProductTypeActive(Number(id), body.isActive);
  }

  @Get('daily-deals')
  @ApiOperation({ summary: 'Obtener configuración de Ofertas del día (admin)' })
  getDailyDeals() {
    return this.landingService.getDailyDeals();
  }

  @Put('daily-deals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guardar configuración de Ofertas del día' })
  updateDailyDeals(@Body() body: { featuredItems?: any[]; carouselProductIds?: number[] }) {
    return this.landingService.updateDailyDeals(body);
  }

  @Get('brands')
  @ApiOperation({ summary: 'Obtener marcas para la landing (admin)' })
  getLandingBrands() {
    return this.landingService.getLandingBrands();
  }

  @Put('brands')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar marcas seleccionadas para la landing' })
  updateLandingBrands(@Body() body: { codes: string[] }) {
    return this.landingService.updateLandingBrands(body.codes);
  }

  @Patch('brands/:id/active')
  @ApiOperation({ summary: 'Activar/desactivar una marca en la landing' })
  toggleBrandActive(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.landingService.toggleLandingBrandActive(Number(id), body.isActive);
  }

  @Get('benefits')
  @ApiOperation({ summary: 'Obtener beneficios de landing (admin)' })
  getLandingBenefits() {
    return this.landingService.getLandingBenefits();
  }

  @Put('benefits')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guardar beneficios de landing' })
  updateLandingBenefits(@Body() body: any[]) {
    return this.landingService.updateLandingBenefits(body);
  }

  @Get('general-logo')
  @ApiOperation({ summary: 'Obtener logo de la empresa' })
  getGeneralLogo() {
    return this.landingService.getGeneralLogo();
  }

  @Put('general-logo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar logo de la empresa' })
  updateGeneralLogo(@Body() body: { url: string }) {
    return this.landingService.updateGeneralLogo(body);
  }

  @Get('footer')
  @ApiOperation({ summary: 'Obtener configuración del footer (admin)' })
  getFooterConfig() {
    return this.landingService.getFooterConfig();
  }

  @Put('footer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guardar configuración del footer' })
  updateFooterConfig(@Body() body: any) {
    return this.landingService.updateFooterConfig(body);
  }
}

@ApiTags('Landing')
@Controller('landing')
export class LandingPublicController {
  constructor(private readonly landingService: LandingService) {}

  @Public()
  @Get('product-types')
  @ApiOperation({ summary: 'Tipos de producto destacados para la landing' })
  getFeatured() { return this.landingService.getFeaturedProductTypes(); }

  @Public()
  @Get('daily-deals')
  @ApiOperation({ summary: 'Ofertas del día (público)' })
  getDailyDeals() { return this.landingService.getPublicDailyDeals(); }

  @Public()
  @Get('brands')
  @ApiOperation({ summary: 'Marcas visibles en la landing (público)' })
  getPublicBrands() { return this.landingService.getPublicBrands(); }

  @Public()
  @Get('benefits')
  @ApiOperation({ summary: 'Beneficios de landing (público)' })
  getPublicBenefits() { return this.landingService.getPublicBenefits(); }

  @Public()
  @Get('general')
  @ApiOperation({ summary: 'Configuración general (logo)' })
  getGeneral() {
    return this.landingService.getGeneralLogo();
  }

  @Public()
  @Get('footer')
  @ApiOperation({ summary: 'Configuración del footer (público)' })
  getFooter() {
    return this.landingService.getPublicFooterConfig();
  }
}

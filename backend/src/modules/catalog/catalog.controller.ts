import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CatalogService } from './catalog.service';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Obtener categorías del catálogo' })
  @ApiResponse({ status: 200, description: 'Listado de categorías' })
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Public()
  @Get('categories/counts')
  @ApiOperation({ summary: 'Obtener conteo de productos por categoría' })
  @ApiResponse({ status: 200, description: 'Conteo de productos por categoría' })
  getCategoryCounts() {
    return this.catalogService.getCategoryCounts();
  }

  @Public()
  @Post('products')
  @ApiOperation({ summary: 'Obtener productos del catálogo con filtros' })
  @ApiResponse({ status: 200, description: 'Listado de productos' })
  getProducts(@Body() query: CatalogProductsQueryDto) {
    return this.catalogService.getProducts(query);
  }
}

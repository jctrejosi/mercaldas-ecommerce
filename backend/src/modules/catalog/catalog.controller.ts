import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @Get('products')
  @ApiOperation({ summary: 'Obtener productos del catálogo con filtros' })
  @ApiQuery({
    name: 'categories',
    required: false,
    description: 'Categorías separadas por coma',
  })
  @ApiQuery({ name: 'onSale', required: false, type: Boolean })
  @ApiQuery({ name: 'priceRange', required: false, example: '10000-30000' })
  @ApiQuery({ name: 'sort', required: false, example: 'relevancia' })
  @ApiQuery({ name: 'search', required: false, example: 'leche' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Listado de productos' })
  getProducts(@Query() query: CatalogProductsQueryDto) {
    return this.catalogService.getProducts(query);
  }
}

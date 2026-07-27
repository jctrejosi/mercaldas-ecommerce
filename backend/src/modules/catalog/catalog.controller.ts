import { Body, Controller, Get, Param, Post, Query, Res, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CatalogService } from './catalog.service';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';
import { CreateProductDto } from './dto/create-product.dto';

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

  @Public()
  @Post('products/create')
  @ApiOperation({ summary: 'Crear un nuevo producto con su variante' })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Public()
  @Post('products/:id/update')
  @ApiOperation({ summary: 'Actualizar un producto existente' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  updateProduct(@Param('id') id: string, @Body() dto: CreateProductDto) {
    return this.catalogService.updateProduct(Number(id), dto);
  }

  @Public()
  @Get('products/export')
  @ApiOperation({ summary: 'Exportar todos los productos a XLSX' })
  async exportProducts(@Res() res: Response) {
    return this.catalogService.exportProducts(res);
  }

  @Public()
  @Post('products/import')
  @ApiOperation({ summary: 'Importar productos desde archivo JSON' })
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Archivo requerido');
    return this.catalogService.importProducts(file);
  }

  @Public()
  @Get('products/count')
  @ApiOperation({ summary: 'Obtener cantidad total de productos activos' })
  @ApiResponse({ status: 200, description: 'Total de productos' })
  getProductsCount() {
    return this.catalogService.getProductsCount();
  }

  @Public()
  @Get('branches')
  @ApiOperation({ summary: 'Obtener sucursales activas' })
  @ApiResponse({ status: 200, description: 'Listado de sucursales' })
  getBranches() {
    return this.catalogService.getBranches();
  }

  @Public()
  @Get('brands/featured')
  @ApiOperation({ summary: 'Obtener marcas destacadas' })
  @ApiResponse({ status: 200, description: 'Listado de marcas destacadas' })
  getFeaturedBrands() {
    return this.catalogService.getFeaturedBrands();
  }

  @Public()
  @Get('brands')
  @ApiOperation({ summary: 'Obtener marcas del catálogo con conteo de productos' })
  @ApiResponse({ status: 200, description: 'Listado de marcas con productos' })
  getCatalogBrands() {
    return this.catalogService.getCatalogBrands();
  }

  @Public()
  @Get('product-types')
  @ApiOperation({ summary: 'Obtener tipos de producto con conteo' })
  @ApiResponse({ status: 200, description: 'Listado de tipos de producto' })
  getProductTypes() {
    return this.catalogService.getProductTypes();
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  BadRequestException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CatalogService } from './catalog.service';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
  @ApiResponse({
    status: 200,
    description: 'Conteo de productos por categoría',
  })
  getCategoryCounts() {
    return this.catalogService.getCategoryCounts();
  }

  // ── Products ──

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
  getProductsCount(@Query('unbranded') unbranded?: string) {
    return this.catalogService.getProductsCount(unbranded === 'true');
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
  @ApiOperation({
    summary: 'Obtener marcas del catálogo con conteo de productos',
  })
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

  // ── Favorites ──

  @UseGuards(CustomerJwtAuthGuard)
  @Get('favorites')
  @ApiOperation({ summary: 'Obtener productos favoritos del cliente' })
  async getFavorites(@CurrentUser() customer: { sub: number }) {
    return this.catalogService.getFavorites(customer.sub);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('favorites/:productId')
  @ApiOperation({ summary: 'Agregar producto a favoritos' })
  async addFavorite(
    @CurrentUser() customer: { sub: number },
    @Param('productId') productId: string,
  ) {
    await this.catalogService.addFavorite(customer.sub, Number(productId));
    return { success: true };
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Delete('favorites/:productId')
  @ApiOperation({ summary: 'Quitar producto de favoritos' })
  async removeFavorite(
    @CurrentUser() customer: { sub: number },
    @Param('productId') productId: string,
  ) {
    await this.catalogService.removeFavorite(customer.sub, Number(productId));
    return { success: true };
  }

  // ── Shopping Lists ──

  @UseGuards(CustomerJwtAuthGuard)
  @Get('shopping-lists')
  @ApiOperation({ summary: 'Obtener listas de compras del cliente' })
  async getShoppingLists(@CurrentUser() customer: { sub: number }) {
    return this.catalogService.getShoppingLists(customer.sub);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('shopping-lists')
  @ApiOperation({ summary: 'Crear lista de compras' })
  async createShoppingList(
    @CurrentUser() customer: { sub: number },
    @Body() body: { name: string },
  ) {
    return this.catalogService.createShoppingList(customer.sub, body.name);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('shopping-lists/:id')
  @ApiOperation({ summary: 'Actualizar nombre de lista de compras' })
  async updateShoppingList(
    @CurrentUser() customer: { sub: number },
    @Param('id') id: string,
    @Body() body: { name: string },
  ) {
    await this.catalogService.updateShoppingList(
      customer.sub,
      Number(id),
      body.name,
    );
    return { success: true };
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Delete('shopping-lists/:id')
  @ApiOperation({ summary: 'Eliminar lista de compras' })
  async deleteShoppingList(
    @CurrentUser() customer: { sub: number },
    @Param('id') id: string,
  ) {
    await this.catalogService.deleteShoppingList(customer.sub, Number(id));
    return { success: true };
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('shopping-lists/:id/items')
  @ApiOperation({ summary: 'Agregar producto a lista de compras' })
  async addToList(
    @CurrentUser() customer: { sub: number },
    @Param('id') id: string,
    @Body() body: { productId: number; quantity?: number },
  ) {
    await this.catalogService.addToShoppingList(
      customer.sub,
      Number(id),
      body.productId,
      body.quantity ?? 1,
    );
    return { success: true };
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('shopping-lists/:listId/items/:productId')
  @ApiOperation({ summary: 'Actualizar cantidad de item en lista' })
  async updateListItem(
    @CurrentUser() _customer: { sub: number },
    @Param('listId') listId: string,
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    await this.catalogService.updateShoppingListItem(
      Number(listId),
      Number(productId),
      body.quantity,
    );
    return { success: true };
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Delete('shopping-lists/:listId/items/:productId')
  @ApiOperation({ summary: 'Quitar producto de lista de compras' })
  async removeFromList(
    @CurrentUser() _customer: { sub: number },
    @Param('listId') listId: string,
    @Param('productId') productId: string,
  ) {
    await this.catalogService.removeShoppingListItem(
      Number(listId),
      Number(productId),
    );
    return { success: true };
  }
}

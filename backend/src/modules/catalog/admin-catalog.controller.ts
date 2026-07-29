import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CatalogService } from './catalog.service';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';

@ApiTags('Admin - Catálogo')
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ── Categories ──

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Obtener todas las categorías (admin)' })
  async getAllCategories() {
    return this.catalogService.getAllCategoriesAdmin();
  }

  @Public()
  @Post('categories')
  @ApiOperation({ summary: 'Crear categoría' })
  async createCategory(
    @Body() body: { name: string; code?: string; parentId?: number },
  ) {
    return this.catalogService.createCategory(body);
  }

  @Public()
  @Post('categories/:id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  async updateCategory(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      code?: string;
      parentId?: number | null;
      description?: string | null;
      displayOrder?: number;
      metaTitle?: string | null;
      metaDescription?: string | null;
      isActive?: boolean;
      imageUrl?: string;
    },
  ) {
    return this.catalogService.updateCategory(Number(id), body);
  }

  @Public()
  @Delete('categories/:id')
  @ApiOperation({ summary: 'Eliminar categoría (soft delete)' })
  async deleteCategory(@Param('id') id: string) {
    await this.catalogService.deleteCategory(Number(id));
    return { success: true };
  }

  // ── Category Products ──

  @Public()
  @Get('categories/:id/products')
  @ApiOperation({ summary: 'Obtener productos de una categoría' })
  async getCategoryProducts(@Param('id') id: string) {
    return this.catalogService.getCategoryProducts(Number(id));
  }

  @Public()
  @Post('categories/:id/products')
  @ApiOperation({ summary: 'Asignar producto a categoría' })
  async addProductToCategory(
    @Param('id') id: string,
    @Body() body: { productId: number },
  ) {
    await this.catalogService.addProductToCategory(Number(id), body.productId);
    return { success: true };
  }

  @Public()
  @Delete('categories/:id/products/:productId')
  @ApiOperation({ summary: 'Quitar producto de categoría' })
  async removeProductFromCategory(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    await this.catalogService.removeProductFromCategory(
      Number(id),
      Number(productId),
    );
    return { success: true };
  }

  @Public()
  @Post('products/:productId/replace-category')
  @ApiOperation({ summary: 'Reemplazar categoría de un producto' })
  async replaceProductCategory(
    @Param('productId') productId: string,
    @Body() body: { categoryId: number },
  ) {
    await this.catalogService.replaceProductCategory(
      Number(productId),
      body.categoryId,
    );
    return { success: true };
  }

  // ── Products ──

  @Public()
  @Post('products')
  @ApiOperation({ summary: 'Buscar productos (admin, incluye sin categoría)' })
  async getProducts(@Body() query: CatalogProductsQueryDto) {
    return this.catalogService.getProducts(query);
  }

  // ── Brands ──

  @Public()
  @Get('brands')
  @ApiOperation({ summary: 'Obtener todas las marcas (admin)' })
  async getAllBrands() {
    return this.catalogService.getAllBrandsAdmin();
  }

  @Public()
  @Post('brands')
  @ApiOperation({ summary: 'Crear marca' })
  async createBrand(
    @Body()
    body: {
      name: string;
      code?: string;
      website?: string;
      description?: string;
      country?: string;
      isFeatured?: boolean;
      imageUrl?: string;
    },
  ) {
    return this.catalogService.createBrand(body);
  }

  @Public()
  @Post('brands/:id')
  @ApiOperation({ summary: 'Actualizar marca' })
  async updateBrand(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      code?: string;
      website?: string;
      description?: string;
      country?: string;
      isFeatured?: boolean;
      isActive?: boolean;
      imageUrl?: string;
    },
  ) {
    return this.catalogService.updateBrand(Number(id), body);
  }

  @Public()
  @Delete('brands/:id')
  @ApiOperation({ summary: 'Eliminar marca (soft delete)' })
  async deleteBrand(@Param('id') id: string) {
    await this.catalogService.deleteBrand(Number(id));
    return { success: true };
  }

  // ── Brand Products ──

  @Public()
  @Get('brands/:id/products')
  @ApiOperation({ summary: 'Obtener productos de una marca' })
  async getBrandProducts(@Param('id') id: string) {
    return this.catalogService.getBrandProducts(Number(id));
  }

  @Public()
  @Post('brands/:id/products')
  @ApiOperation({ summary: 'Asignar producto a marca' })
  async addProductToBrand(
    @Param('id') id: string,
    @Body() body: { productId: number },
  ) {
    await this.catalogService.addProductToBrand(Number(id), body.productId);
    return { success: true };
  }

  @Public()
  @Delete('brands/:id/products/:productId')
  @ApiOperation({ summary: 'Quitar producto de marca' })
  async removeProductFromBrand(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    await this.catalogService.removeProductFromBrand(Number(productId));
    return { success: true };
  }
}

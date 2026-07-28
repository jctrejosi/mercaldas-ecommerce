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
  async createCategory(@Body() body: { name: string; parentId?: number }) {
    return this.catalogService.createCategory(body);
  }

  @Public()
  @Post('categories/:id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  async updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; isActive?: boolean },
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

  // ── Products ──

  @Public()
  @Post('products')
  @ApiOperation({ summary: 'Buscar productos (admin, incluye sin categoría)' })
  async getProducts(@Body() query: CatalogProductsQueryDto) {
    return this.catalogService.getProducts(query);
  }
}

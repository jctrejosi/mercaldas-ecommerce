import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { FeaturedProductsService } from './featured-products.service';

@ApiTags('Admin - Featured Products')
@Controller('admin/featured')
export class AdminFeaturedProductsController {
  constructor(private readonly featuredService: FeaturedProductsService) {}

  @Get('tabs')
  @ApiOperation({ summary: 'Obtener pestañas de productos destacados' })
  getTabs() {
    return this.featuredService.getAdminTabs();
  }

  @Post('tabs')
  @ApiOperation({ summary: 'Crear una pestaña de productos destacados' })
  createTab(
    @Body()
    body: {
      name: string;
      slug?: string;
      position?: number;
      queryOnSale?: boolean;
      querySort?: string;
    },
  ) {
    return this.featuredService.createTab(body);
  }

  @Put('tabs/:id')
  @ApiOperation({ summary: 'Actualizar una pestaña' })
  updateTab(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      slug?: string;
      position?: number;
      isActive?: boolean;
      queryOnSale?: boolean | null;
      querySort?: string | null;
    },
  ) {
    return this.featuredService.updateTab(Number(id), body);
  }

  @Delete('tabs/:id')
  @ApiOperation({ summary: 'Eliminar una pestaña' })
  deleteTab(@Param('id') id: string) {
    return this.featuredService.deleteTab(Number(id));
  }

  @Get('tabs/:id/products')
  @ApiOperation({ summary: 'Obtener productos asignados a una pestaña' })
  getTabProducts(@Param('id') id: string) {
    return this.featuredService.getTabProducts(Number(id));
  }

  @Post('tabs/:id/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Asignar productos a una pestaña' })
  assignProducts(
    @Param('id') id: string,
    @Body() body: { productIds: number[] },
  ) {
    return this.featuredService.assignProducts(Number(id), body.productIds);
  }

  @Delete('tabs/:id/products/:productId')
  @ApiOperation({ summary: 'Quitar un producto de una pestaña' })
  removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.featuredService.removeProduct(Number(id), Number(productId));
  }

  @Put('tabs/:id/products/reorder')
  @ApiOperation({ summary: 'Reordenar productos de una pestaña' })
  reorderProducts(
    @Param('id') id: string,
    @Body() body: { productIds: number[] },
  ) {
    return this.featuredService.reorderProducts(Number(id), body.productIds);
  }

  @Get('products/search')
  @ApiOperation({ summary: 'Buscar productos para asignar a pestañas' })
  searchProducts(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    return this.featuredService.searchProducts(q ?? '', limit ? Number(limit) : 20);
  }
}

@ApiTags('Featured Products')
@Controller('featured')
export class FeaturedPublicController {
  constructor(private readonly featuredService: FeaturedProductsService) {}

  @Public()
  @Get('tabs')
  @ApiOperation({ summary: 'Pestañas activas de productos destacados' })
  getTabs() {
    return this.featuredService.getPublicTabs();
  }

  @Public()
  @Get('tabs/:slug/products')
  @ApiOperation({ summary: 'Productos de una pestaña destacada' })
  getTabProducts(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ) {
    return this.featuredService.getPublicTabProducts(
      slug,
      limit ? Number(limit) : 12,
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import {
  CreateBannerDto,
  UpdateBannerDto,
  QueryBannersDto,
} from './dto/banner.dto';
import { DrizzleService } from '../../database/drizzle.service';
import { media } from '../../../drizzle/schema';

@ApiTags('Admin - Banners')
@Controller('admin/banners')
export class AdminBannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly drizzle: DrizzleService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los banners' })
  @ApiQuery({
    name: 'bannerType',
    required: false,
    description: 'Filtrar: hero, promo, sidebar, footer',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar: activo, programado, inactivo, expirado',
  })
  @ApiResponse({ status: 200, description: 'Listado de banners' })
  findAll(@Query() query: QueryBannersDto) {
    return this.bannersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un banner' })
  @ApiResponse({ status: 200, description: 'Detalle del banner' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(Number(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo banner' })
  @ApiResponse({ status: 201, description: 'Banner creado' })
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un banner existente' })
  @ApiResponse({ status: 200, description: 'Banner actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(Number(id), dto);
  }

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear media desde URL' })
  @ApiResponse({ status: 200, description: 'Media creado' })
  async uploadUrl(@Body() body: { url: string; mediaType?: string }) {
    const [row] = await this.drizzle.db
      .insert(media)
      .values({
        path: body.url,
        fileName: body.url.split('/').pop() || 'image',
        mimeType: body.mediaType || 'image/webp',
        sizeBytes: 0,
        checksum: `url_${Date.now()}`,
        mediaType: 'image',
      })
      .returning({ id: media.id });
    return { mediaId: Number(row.id), url: body.url };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un banner' })
  @ApiResponse({ status: 200, description: 'Banner eliminado' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(Number(id));
  }
}

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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PopupsService } from './popups.service';
import { CreatePopupDto, UpdatePopupDto } from './dto/popup.dto';
import { DrizzleService } from '../../database/drizzle.service';
import { media } from '../../../drizzle/schema';

@ApiTags('Admin - Popups')
@Controller('admin/popups')
export class AdminPopupsController {
  constructor(
    private readonly popupsService: PopupsService,
    private readonly drizzle: DrizzleService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los popups' })
  @ApiResponse({ status: 200, description: 'Listado de popups' })
  findAll() {
    return this.popupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un popup' })
  @ApiResponse({ status: 200, description: 'Detalle del popup' })
  findOne(@Param('id') id: string) {
    return this.popupsService.findOne(Number(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo popup' })
  @ApiResponse({ status: 201, description: 'Popup creado' })
  create(@Body() dto: CreatePopupDto) {
    return this.popupsService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un popup existente' })
  @ApiResponse({ status: 200, description: 'Popup actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdatePopupDto) {
    return this.popupsService.update(Number(id), dto);
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
  @ApiOperation({ summary: 'Eliminar un popup' })
  @ApiResponse({ status: 200, description: 'Popup eliminado' })
  remove(@Param('id') id: string) {
    return this.popupsService.remove(Number(id));
  }
}

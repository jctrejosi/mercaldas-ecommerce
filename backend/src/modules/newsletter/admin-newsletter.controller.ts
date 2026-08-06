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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  QuerySubscribersDto,
} from './dto/newsletter.dto';

@ApiTags('Admin - Newsletter')
@Controller('admin/newsletter')
export class AdminNewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  // ── Suscriptores ──
  @Get('subscribers')
  @ApiOperation({ summary: 'Listar suscriptores' })
  @ApiResponse({ status: 200, description: 'Listado de suscriptores' })
  listSubscribers(@Query() query: QuerySubscribersDto) {
    return this.newsletterService.listSubscribers(query);
  }

  @Get('subscribers/count')
  @ApiOperation({ summary: 'Contar suscriptores activos' })
  @ApiResponse({ status: 200, description: 'Total' })
  countSubscribers() {
    return this.newsletterService
      .countActiveSubscribers()
      .then((total) => ({ total }));
  }

  @Delete('subscribers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar suscriptor' })
  @ApiResponse({ status: 200, description: 'Suscriptor eliminado' })
  removeSubscriber(@Param('id') id: string) {
    return this.newsletterService.removeSubscriber(Number(id));
  }

  // ── Campañas ──
  @Get('campaigns')
  @ApiOperation({ summary: 'Listar campañas' })
  @ApiResponse({ status: 200, description: 'Listado de campañas' })
  listCampaigns() {
    return this.newsletterService.listCampaigns();
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Obtener una campaña' })
  @ApiResponse({ status: 200, description: 'Detalle de campaña' })
  findCampaign(@Param('id') id: string) {
    return this.newsletterService.findCampaign(Number(id));
  }

  @Post('campaigns')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear campaña' })
  @ApiResponse({ status: 201, description: 'Campaña creada' })
  createCampaign(@Body() dto: CreateCampaignDto) {
    return this.newsletterService.createCampaign(dto);
  }

  @Post('campaigns/:id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar campaña ahora' })
  @ApiResponse({ status: 200, description: 'Campaña enviada' })
  sendCampaign(@Param('id') id: string) {
    return this.newsletterService.sendCampaignNow(Number(id));
  }

  @Put('campaigns/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar campaña' })
  @ApiResponse({ status: 200, description: 'Campaña actualizada' })
  updateCampaign(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.newsletterService.updateCampaign(Number(id), dto);
  }

  @Delete('campaigns/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar campaña' })
  @ApiResponse({ status: 200, description: 'Campaña eliminada' })
  deleteCampaign(@Param('id') id: string) {
    return this.newsletterService.deleteCampaign(Number(id));
  }
}

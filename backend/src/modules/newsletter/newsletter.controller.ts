import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/newsletter.dto';

@ApiTags('Newsletter Público')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Suscribirse al newsletter' })
  @ApiResponse({ status: 201, description: 'Suscripción creada' })
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Public()
  @Get('unsubscribe')
  @ApiOperation({ summary: 'Cancelar suscripción por correo' })
  @ApiResponse({ status: 200, description: 'Suscripción cancelada' })
  unsubscribe(@Query('email') email: string) {
    return this.newsletterService.unsubscribe(email);
  }

  @Public()
  @Get('count')
  @ApiOperation({ summary: 'Cantidad de suscriptores activos' })
  @ApiResponse({ status: 200, description: 'Total de suscriptores' })
  count() {
    return this.newsletterService
      .countActiveSubscribers()
      .then((total) => ({ total }));
  }
}

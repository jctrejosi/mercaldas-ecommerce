import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { WompiService } from './wompi.service';
import { EpaycoService } from './epayco.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly wompiService: WompiService,
    private readonly epaycoService: EpaycoService,
  ) {}

  @Public()
  @Get('epayco/config')
  @ApiOperation({ summary: 'Obtener configuración pública de ePayco' })
  @ApiResponse({ status: 200, description: 'Configuración pública de ePayco' })
  getEpaycoConfig() {
    return this.epaycoService.getPublicConfig();
  }

  @Public()
  @Post('epayco/tokenize-card')
  @ApiOperation({ summary: 'Tokenizar tarjeta con ePayco' })
  @ApiResponse({ status: 200, description: 'Tarjeta tokenizada con ePayco' })
  tokenizeEpaycoCard(
    @Body()
    body: {
      cardNumber: string;
      expYear: string;
      expMonth: string;
      cvc: string;
      cardHolder: string;
    },
  ) {
    return this.epaycoService.createCardToken(body);
  }

  @Public()
  @Get('wompi/config')
  @ApiOperation({ summary: 'Obtener configuración pública de Wompi' })
  @ApiResponse({ status: 200, description: 'Configuración pública de Wompi' })
  getWompiConfig() {
    return this.wompiService.getAcceptanceData();
  }
}

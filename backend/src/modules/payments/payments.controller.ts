import { Body, Controller, Get, Post } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { DrizzleService } from '../../database/drizzle.service';
import { WompiService } from './wompi.service';
import { EpaycoService } from './epayco.service';
import { settings } from '../../../drizzle/schema';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly wompiService: WompiService,
    private readonly epaycoService: EpaycoService,
    private readonly drizzle: DrizzleService,
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
  async getWompiConfig() {
    // Verificar si Wompi está habilitado
    const [row] = await this.drizzle.db.select().from(settings).where(eq(settings.key, 'payment_methods')).limit(1);
    if (row) {
      const value = row.value as any;
      if (value?.wompi?.enabled === false) {
        return { enabled: false };
      }
    }
    try { return await this.wompiService.getAcceptanceData(); } catch { return { enabled: false }; }
  }

  @Public()
  @Get('methods')
  @ApiOperation({ summary: 'Obtener medios de pago habilitados' })
  @ApiResponse({ status: 200, description: 'Configuración de medios de pago' })
  async getPaymentMethods() {
    const [row] = await this.drizzle.db.select().from(settings).where(eq(settings.key, 'payment_methods')).limit(1);
    const defaults = {
      efectivo: { enabled: true },
      wompi: { enabled: true, methods: { card: true, pse: true, nequi: true } },
      breb: { enabled: true, key: '@davi3148853458', bank: 'Davivienda', qrImageUrl: '' },
    };
    if (!row) {
      return defaults;
    }
    const value = row.value as any;
    return {
      efectivo: { enabled: value?.efectivo?.enabled ?? true },
      wompi: {
        enabled: value?.wompi?.enabled ?? true,
        methods: {
          card: value?.wompi?.methods?.card ?? true,
          pse: value?.wompi?.methods?.pse ?? true,
          nequi: value?.wompi?.methods?.nequi ?? true,
        },
      },
      breb: {
        enabled: value?.breb?.enabled ?? true,
        key: value?.breb?.key ?? '@davi3148853458',
        bank: value?.breb?.bank ?? 'Davivienda',
        qrImageUrl: value?.breb?.qrImageUrl ?? '',
      },
    };
  }
}

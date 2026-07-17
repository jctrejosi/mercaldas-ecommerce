import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { WompiService } from './wompi.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly wompiService: WompiService) {}

  @Public()
  @Get('wompi/config')
  @ApiOperation({ summary: 'Obtener configuración pública de Wompi' })
  @ApiResponse({ status: 200, description: 'Configuración pública de Wompi' })
  getWompiConfig() {
    return this.wompiService.getAcceptanceData();
  }
}

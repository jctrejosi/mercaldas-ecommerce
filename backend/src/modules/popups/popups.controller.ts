import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PopupsService } from './popups.service';

@ApiTags('Popups Públicos')
@Controller('popups')
export class PopupsController {
  constructor(private readonly popupsService: PopupsService) {}

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Listar popups activos (público)' })
  @ApiResponse({ status: 200, description: 'Listado de popups activos' })
  findActive() {
    return this.popupsService.findActive();
  }
}

import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api-status')
  @ApiOperation({
    summary: 'API Status',
    description: 'Verifica el estado de la API y sus servicios (base de datos)',
  })
  @ApiOkResponse({
    description: 'API saludable',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-01-15T10:00:00.000Z',
        services: {
          database: {
            status: 'connected',
            message: 'Database connection successful',
            timestamp: '2026-01-15T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'La base de datos no está disponible',
    schema: {
      example: {
        status: 'error',
        timestamp: '2026-01-15T10:00:00.000Z',
        services: {
          database: {
            status: 'disconnected',
            message: 'Database connection failed: Connection refused',
            timestamp: '2026-01-15T10:00:00.000Z',
          },
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getHealth() {
    return this.appService.getHealth();
  }

  @Get('db-status')
  @ApiOperation({
    summary: 'Database Status',
    description:
      'Verifica exclusivamente el estado de la conexión a la base de datos',
  })
  @ApiOkResponse({
    description: 'Conexión a base de datos exitosa',
    schema: {
      example: {
        status: 'connected',
        message: 'Database connection successful',
        timestamp: '2026-01-15T10:00:00.000Z',
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'Error de conexión a la base de datos',
    schema: {
      example: {
        status: 'disconnected',
        message: 'Database connection failed: Connection refused',
        timestamp: '2026-01-15T10:00:00.000Z',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getDbStatus() {
    return this.appService.checkDatabaseConnection();
  }
}

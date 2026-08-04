import { Module } from '@nestjs/common';
import { AdminBannersController } from './admin-banners.controller';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';

@Module({
  controllers: [AdminBannersController, BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}

import { Module } from '@nestjs/common';
import { AdminPopupsController } from './admin-popups.controller';
import { PopupsController } from './popups.controller';
import { PopupsService } from './popups.service';

@Module({
  controllers: [AdminPopupsController, PopupsController],
  providers: [PopupsService],
  exports: [PopupsService],
})
export class PopupsModule {}

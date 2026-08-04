import { Module } from '@nestjs/common';
import { AdminLandingController, LandingPublicController } from './landing.controller';
import { LandingService } from './landing.service';

@Module({
  controllers: [AdminLandingController, LandingPublicController],
  providers: [LandingService],
})
export class LandingModule {}

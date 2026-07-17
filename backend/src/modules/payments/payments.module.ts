import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { WompiService } from './wompi.service';

@Module({
  controllers: [PaymentsController],
  providers: [WompiService],
  exports: [WompiService],
})
export class PaymentsModule {}

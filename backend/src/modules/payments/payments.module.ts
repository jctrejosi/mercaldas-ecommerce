import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { WompiService } from './wompi.service';
import { EpaycoService } from './epayco.service';

@Module({
  controllers: [PaymentsController],
  providers: [WompiService, EpaycoService],
  exports: [WompiService, EpaycoService],
})
export class PaymentsModule {}

import { Module } from '@nestjs/common';
import { AdminBranchesController } from './admin-branches.controller';
import { BranchesService } from './branches.service';

@Module({
  controllers: [AdminBranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}

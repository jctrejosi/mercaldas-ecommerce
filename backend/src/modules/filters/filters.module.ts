import { Module } from '@nestjs/common';
import { AdminFiltersController } from './admin-filters.controller';
import { FiltersController } from './filters.controller';
import { FiltersService } from './filters.service';

@Module({
  controllers: [AdminFiltersController, FiltersController],
  providers: [FiltersService],
  exports: [FiltersService],
})
export class FiltersModule {}

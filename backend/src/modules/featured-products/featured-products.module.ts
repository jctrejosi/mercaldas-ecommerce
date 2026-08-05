import { Module } from '@nestjs/common';
import {
  AdminFeaturedProductsController,
  FeaturedPublicController,
} from './featured-products.controller';
import { FeaturedProductsService } from './featured-products.service';

@Module({
  controllers: [AdminFeaturedProductsController, FeaturedPublicController],
  providers: [FeaturedProductsService],
})
export class FeaturedProductsModule {}

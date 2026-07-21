import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './database//drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerAuthModule } from './modules/customer-auth/customer-auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CartModule } from './modules/cart/cart.module';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  corsConfig,
  helmetConfig,
  cloudinaryConfig,
  wompiConfig,
  epaycoConfig,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        corsConfig,
        helmetConfig,
        cloudinaryConfig,
        wompiConfig,
        epaycoConfig,
      ],
      isGlobal: true,
    }),
    DrizzleModule,
    AuthModule,
    CustomerAuthModule,
    CatalogModule,
    OrdersModule,
    PaymentsModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

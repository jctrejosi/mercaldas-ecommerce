import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNumber()
  productId!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderAddressDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CardPaymentDetailsDto {
  @IsOptional()
  @IsString()
  provider?: 'epayco' | 'wompi';

  @IsString()
  @IsNotEmpty()
  cardholderName!: string;

  @IsString()
  @IsNotEmpty()
  cardToken!: string;

  @IsOptional()
  @IsString()
  acceptanceToken?: string;

  @IsOptional()
  @IsString()
  acceptPersonalAuth?: string;

  @IsString()
  @IsNotEmpty()
  last4!: string;

  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  installments?: number;
}

export class PsePaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  bank!: string;

  @IsEnum(['natural', 'juridica'])
  personType!: 'natural' | 'juridica';
}

export class NequiPaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class PaymentDetailsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CardPaymentDetailsDto)
  card?: CardPaymentDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PsePaymentDetailsDto)
  pse?: PsePaymentDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NequiPaymentDetailsDto)
  nequi?: NequiPaymentDetailsDto;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ValidateNested()
  @Type(() => CreateOrderAddressDto)
  address!: CreateOrderAddressDto;

  @IsEnum(['standard', 'express'])
  shippingType!: 'standard' | 'express';

  @IsEnum(['efectivo', 'tarjeta', 'nequi', 'pse'])
  paymentMethod!: 'efectivo' | 'tarjeta' | 'nequi' | 'pse';

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails?: PaymentDetailsDto;
}

import {
  IsArray,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateCartItemDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  productId!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class UpdateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartItemDto)
  items!: UpdateCartItemDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { PRODUCT_CATEGORIES } from '../../domain/product.entity';

export class ProductRequestDto {
  @ApiProperty({ example: 'Whey Protein 900g' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'Suplemento sabor chocolate', required: false })
  @IsOptional()
  @IsString()
  description: string = '';

  @ApiProperty({ example: 149.9, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10, minimum: 0 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ enum: PRODUCT_CATEGORIES, example: 'SUPPLEMENT', required: false })
  @IsOptional()
  @IsIn([...PRODUCT_CATEGORIES])
  category?: string;

  @ApiProperty({ example: 5, minimum: 0, required: false, description: 'Estoque mínimo: gera alerta quando saldo <= mínimo' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;
}

export class ProductResponseDto {
  @ApiProperty({ example: '665f1c2e8f1b2c0012a4b7d1' }) id: string;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() price: number;
  @ApiProperty() stock: number;
  @ApiProperty({ enum: PRODUCT_CATEGORIES }) category: string;
  @ApiProperty() minStock: number;
  @ApiProperty({ description: 'true quando saldo <= estoque mínimo (RF07)' }) lowStock: boolean;
  @ApiProperty({ example: '2026-10-26T12:00:00.000Z' }) createdAt: string;
}

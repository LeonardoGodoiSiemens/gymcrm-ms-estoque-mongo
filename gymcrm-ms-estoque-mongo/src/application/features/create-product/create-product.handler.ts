import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/product.entity';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../../domain/product.repository';
import { ProductView, toView } from '../../shared/product-view';

export interface CreateProductCommand {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  minStock?: number;
}

@Injectable()
export class CreateProductHandler {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<ProductView> {
    const product = Product.create(command);
    const saved = await this.repository.create(product);
    return toView(saved);
  }
}

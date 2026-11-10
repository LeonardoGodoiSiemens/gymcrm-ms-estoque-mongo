import { Inject, Injectable } from '@nestjs/common';
import { ProductNotFoundError } from '../../../domain/errors';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../../domain/product.repository';
import { ProductView, toView } from '../../shared/product-view';

export interface UpdateProductCommand {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  minStock?: number;
}

@Injectable()
export class UpdateProductHandler {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: ProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<ProductView> {
    const product = await this.repository.findById(command.id);
    if (!product) throw new ProductNotFoundError(command.id);
    product.update(command);
    const saved = await this.repository.update(product);
    if (!saved) throw new ProductNotFoundError(command.id);
    return toView(saved);
  }
}

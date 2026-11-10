import { Inject, Injectable } from '@nestjs/common';
import { ProductNotFoundError } from '../../../domain/errors';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../../domain/product.repository';
import { ProductView, toView } from '../../shared/product-view';

export interface GetProductQuery {
  id: string;
}

@Injectable()
export class GetProductHandler {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: ProductRepository) {}

  async execute(query: GetProductQuery): Promise<ProductView> {
    const product = await this.repository.findById(query.id);
    if (!product) throw new ProductNotFoundError(query.id);
    return toView(product);
  }
}

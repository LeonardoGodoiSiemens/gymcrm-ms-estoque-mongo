import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../../domain/product.repository';
import { ProductView, toView } from '../../shared/product-view';

export interface ListProductsQuery {
  page?: number;
  limit?: number;
}

@Injectable()
export class ListProductsHandler {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: ProductRepository) {}

  async execute(query: ListProductsQuery = {}): Promise<ProductView[]> {
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
    const page = Math.max(query.page ?? 1, 1);
    const products = await this.repository.findAll({ skip: (page - 1) * limit, limit });
    return products.map(toView);
  }
}

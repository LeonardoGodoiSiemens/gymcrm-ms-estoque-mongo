import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../../domain/product.repository';
import { ProductView, toView } from '../../shared/product-view';

export interface ListLowStockProductsQuery {
  page?: number;
  limit?: number;
}

/** RF07 — itens cujo saldo está igual ou abaixo do estoque mínimo configurado. */
@Injectable()
export class ListLowStockProductsHandler {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: ProductRepository) {}

  async execute(query: ListLowStockProductsQuery = {}): Promise<ProductView[]> {
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
    const page = Math.max(query.page ?? 1, 1);
    const products = await this.repository.findLowStock({ skip: (page - 1) * limit, limit });
    return products.map(toView);
  }
}

import { Product } from './product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ListOptions {
  skip: number;
  limit: number;
}

export interface ProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(options: ListOptions): Promise<Product[]>;
  /** Itens com saldo <= estoque mínimo (RF07). */
  findLowStock(options: ListOptions): Promise<Product[]>;
  update(product: Product): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

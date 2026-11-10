import { Product } from '../../domain/product.entity';

export interface ProductView {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  minStock: number;
  lowStock: boolean;
  createdAt: string;
}

export function toView(product: Product): ProductView {
  return {
    id: product.id as string,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    minStock: product.minStock,
    lowStock: product.lowStock,
    createdAt: product.createdAt.toISOString(),
  };
}

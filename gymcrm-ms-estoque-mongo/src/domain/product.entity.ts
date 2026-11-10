import { DomainValidationError } from './errors';

/** Categorias de itens controlados em estoque pela academia (RF06). */
export const PRODUCT_CATEGORIES = ['SUPPLEMENT', 'ACCESSORY', 'APPAREL', 'MAINTENANCE', 'OTHER'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  minStock?: number;
}

function validate(data: ProductData): void {
  if (!data.name || data.name.trim().length === 0) {
    throw new DomainValidationError('Product name is required');
  }
  if (typeof data.price !== 'number' || Number.isNaN(data.price) || data.price < 0) {
    throw new DomainValidationError('Product price must be a number >= 0');
  }
  if (!Number.isInteger(data.stock) || data.stock < 0) {
    throw new DomainValidationError('Product stock must be an integer >= 0');
  }
  if (data.minStock !== undefined && (!Number.isInteger(data.minStock) || data.minStock < 0)) {
    throw new DomainValidationError('Product minStock must be an integer >= 0');
  }
  if (data.category !== undefined && !(PRODUCT_CATEGORIES as readonly string[]).includes(data.category)) {
    throw new DomainValidationError(`Product category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`);
  }
}

export class Product {
  constructor(
    public readonly id: string | null,
    public name: string,
    public description: string,
    public price: number,
    public stock: number,
    public readonly createdAt: Date,
    public category: ProductCategory = 'OTHER',
    public minStock: number = 0,
  ) {}

  static create(data: ProductData, now: Date = new Date()): Product {
    validate(data);
    return new Product(
      null, data.name.trim(), data.description ?? '', data.price, data.stock, now,
      (data.category as ProductCategory) ?? 'OTHER', data.minStock ?? 0,
    );
  }

  update(data: ProductData): void {
    validate(data);
    this.name = data.name.trim();
    this.description = data.description ?? '';
    this.price = data.price;
    this.stock = data.stock;
    this.category = (data.category as ProductCategory) ?? this.category;
    this.minStock = data.minStock ?? this.minStock;
  }

  /** RF07 — alerta de estoque mínimo: saldo igual ou abaixo do mínimo configurado (e mínimo > 0). */
  get lowStock(): boolean {
    return this.minStock > 0 && this.stock <= this.minStock;
  }
}

import { Product } from '../../src/domain/product.entity';
import { ListOptions, ProductRepository } from '../../src/domain/product.repository';

export class InMemoryProductRepository implements ProductRepository {
  private items = new Map<string, Product>();
  private seq = 0;

  async create(product: Product): Promise<Product> {
    const id = `id-${++this.seq}`;
    const saved = new Product(id, product.name, product.description, product.price, product.stock, product.createdAt, product.category, product.minStock);
    this.items.set(id, saved);
    return saved;
  }
  async findById(id: string) { return this.items.get(id) ?? null; }
  async findAll(o: ListOptions) { return [...this.items.values()].slice(o.skip, o.skip + o.limit); }
  async findLowStock(o: ListOptions) { return [...this.items.values()].filter((p) => p.lowStock).slice(o.skip, o.skip + o.limit); }
  async update(product: Product) {
    if (!product.id || !this.items.has(product.id)) return null;
    this.items.set(product.id, product);
    return product;
  }
  async delete(id: string) { return this.items.delete(id); }
}

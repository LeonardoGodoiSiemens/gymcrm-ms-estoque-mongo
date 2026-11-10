import { CreateProductHandler } from '../../src/application/features/create-product/create-product.handler';
import { DeleteProductHandler } from '../../src/application/features/delete-product/delete-product.handler';
import { GetProductHandler } from '../../src/application/features/get-product/get-product.handler';
import { ListLowStockProductsHandler } from '../../src/application/features/list-low-stock-products/list-low-stock-products.handler';
import { ListProductsHandler } from '../../src/application/features/list-products/list-products.handler';
import { UpdateProductHandler } from '../../src/application/features/update-product/update-product.handler';
import { DomainValidationError, ProductNotFoundError } from '../../src/domain/errors';
import { InMemoryProductRepository } from '../fakes/in-memory-product.repository';

describe('Product use cases', () => {
  let repo: InMemoryProductRepository;
  let create: CreateProductHandler;
  let get: GetProductHandler;
  let list: ListProductsHandler;
  let update: UpdateProductHandler;
  let remove: DeleteProductHandler;
  let lowStock: ListLowStockProductsHandler;
  const data = { name: 'Creatina 300g', description: 'Monohidratada', price: 90, stock: 5, category: 'SUPPLEMENT', minStock: 2 };

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    create = new CreateProductHandler(repo);
    get = new GetProductHandler(repo);
    list = new ListProductsHandler(repo);
    update = new UpdateProductHandler(repo);
    remove = new DeleteProductHandler(repo);
    lowStock = new ListLowStockProductsHandler(repo);
  });

  describe('CreateProduct', () => {
    it('persists and returns a view with id', async () => {
      const view = await create.execute(data);
      expect(view.id).toBeDefined();
      expect(view.name).toBe('Creatina 300g');
      expect(typeof view.createdAt).toBe('string');
    });
    it('propagates domain validation errors', async () => {
      await expect(create.execute({ ...data, price: -1 })).rejects.toBeInstanceOf(DomainValidationError);
    });
  });

  describe('GetProduct', () => {
    it('returns an existing product', async () => {
      const created = await create.execute(data);
      expect((await get.execute({ id: created.id })).name).toBe('Creatina 300g');
    });
    it('throws ProductNotFoundError when missing', async () => {
      await expect(get.execute({ id: 'nope' })).rejects.toBeInstanceOf(ProductNotFoundError);
    });
  });

  describe('ListProducts', () => {
    it('lists with pagination and clamps limits', async () => {
      for (let i = 0; i < 5; i++) await create.execute({ ...data, name: `P${i}` });
      expect(await list.execute({ page: 1, limit: 2 })).toHaveLength(2);
      expect(await list.execute({ page: 3, limit: 2 })).toHaveLength(1);
      expect(await list.execute()).toHaveLength(5);
      expect(await list.execute({ limit: 0 })).toHaveLength(1); // clamped to 1
    });
  });

  describe('UpdateProduct', () => {
    it('updates an existing product', async () => {
      const created = await create.execute(data);
      const updated = await update.execute({ id: created.id, name: 'Creatina 600g', description: '', price: 1200, stock: 2 });
      expect(updated.price).toBe(1200);
      expect((await get.execute({ id: created.id })).name).toBe('Creatina 600g');
    });
    it('throws when product does not exist', async () => {
      await expect(update.execute({ id: 'x', ...data })).rejects.toBeInstanceOf(ProductNotFoundError);
    });
    it('rejects invalid data', async () => {
      const created = await create.execute(data);
      await expect(update.execute({ id: created.id, ...data, stock: -3 })).rejects.toBeInstanceOf(DomainValidationError);
    });
  });

  describe('ListLowStockProducts (RF07)', () => {
    it('returns only items with stock <= minStock', async () => {
      await create.execute(data); // 5 > 2: ok
      await create.execute({ ...data, name: 'Luva', stock: 1 }); // 1 <= 2: baixo
      await create.execute({ ...data, name: 'Sem mínimo', stock: 0, minStock: 0 }); // sem mínimo: ignorado
      const result = await lowStock.execute();
      expect(result.map((p) => p.name)).toEqual(['Luva']);
      expect(result[0].lowStock).toBe(true);
    });
  });

  describe('DeleteProduct', () => {
    it('deletes an existing product', async () => {
      const created = await create.execute(data);
      await remove.execute({ id: created.id });
      await expect(get.execute({ id: created.id })).rejects.toBeInstanceOf(ProductNotFoundError);
    });
    it('throws when product does not exist', async () => {
      await expect(remove.execute({ id: 'x' })).rejects.toBeInstanceOf(ProductNotFoundError);
    });
  });
});

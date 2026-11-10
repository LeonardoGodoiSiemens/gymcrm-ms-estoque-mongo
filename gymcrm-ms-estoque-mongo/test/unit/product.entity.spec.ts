import { DomainValidationError } from '../../src/domain/errors';
import { Product } from '../../src/domain/product.entity';

describe('Product (domain)', () => {
  const valid = { name: ' Whey Protein ', description: '900g', price: 150, stock: 3, category: 'SUPPLEMENT', minStock: 5 };

  it('creates a product trimming the name', () => {
    const p = Product.create(valid);
    expect(p.name).toBe('Whey Protein');
    expect(p.id).toBeNull();
  });

  it.each([
    [{ ...valid, name: '  ' }],
    [{ ...valid, price: -1 }],
    [{ ...valid, price: NaN }],
    [{ ...valid, stock: -1 }],
    [{ ...valid, stock: 1.5 }],
    [{ ...valid, minStock: -1 }],
    [{ ...valid, category: 'FOOD' }],
  ])('rejects invalid data %#', (data) => {
    expect(() => Product.create(data)).toThrow(DomainValidationError);
  });

  it('defaults category to OTHER and minStock to 0 (never low stock)', () => {
    const p = Product.create({ name: 'Toalha', description: '', price: 20, stock: 0 });
    expect(p).toMatchObject({ category: 'OTHER', minStock: 0, lowStock: false });
  });

  it('flags lowStock when stock <= minStock (RF07)', () => {
    expect(Product.create({ ...valid, stock: 5 }).lowStock).toBe(true);
    expect(Product.create({ ...valid, stock: 3 }).lowStock).toBe(true);
    expect(Product.create({ ...valid, stock: 6 }).lowStock).toBe(false);
  });

  it('updates fields when valid and rejects invalid updates', () => {
    const p = Product.create(valid);
    p.update({ name: 'Corda de pular', description: '', price: 10, stock: 1, category: 'ACCESSORY', minStock: 0 });
    expect(p.name).toBe('Corda de pular');
    expect(() => p.update({ ...valid, price: -5 })).toThrow(DomainValidationError);
  });
});

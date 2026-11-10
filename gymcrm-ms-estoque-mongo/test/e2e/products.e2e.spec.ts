import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../../src/api/configure-app';
import { ProductsController } from '../../src/api/products.controller';
import { PRODUCT_HANDLERS } from '../../src/api/products.module';
import { PRODUCT_REPOSITORY } from '../../src/domain/product.repository';
import { InMemoryProductRepository } from '../fakes/in-memory-product.repository';

describe('Products API (e2e, in-memory repository)', () => {
  let app: INestApplication;
  const body = { name: 'Barra de proteína', description: 'Caixa c/ 12', price: 90, stock: 4, category: 'SUPPLEMENT', minStock: 5 };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [...PRODUCT_HANDLERS, { provide: PRODUCT_REPOSITORY, useValue: new InMemoryProductRepository() }],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(async () => app.close());

  it('full CRUD flow', async () => {
    const created = await request(app.getHttpServer()).post('/products').send(body).expect(201);
    const id = created.body.id;
    expect(created.body).toMatchObject({ name: 'Barra de proteína', price: 90, category: 'SUPPLEMENT', lowStock: true });

    await request(app.getHttpServer()).get(`/products/${id}`).expect(200);
    const list = await request(app.getHttpServer()).get('/products').expect(200);
    expect(list.body).toHaveLength(1);

    const updated = await request(app.getHttpServer()).put(`/products/${id}`).send({ ...body, price: 70, stock: 20 }).expect(200);
    expect(updated.body).toMatchObject({ price: 70, lowStock: false });

    await request(app.getHttpServer()).delete(`/products/${id}`).expect(204);
    await request(app.getHttpServer()).get(`/products/${id}`).expect(404);
  });

  it('lists low-stock items on /products/low-stock', async () => {
    await request(app.getHttpServer()).post('/products').send(body).expect(201);
    const res = await request(app.getHttpServer()).get('/products/low-stock').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].lowStock).toBe(true);
  });

  it('returns 400 for invalid payload (validation pipe)', async () => {
    await request(app.getHttpServer()).post('/products').send({ name: '', price: 'abc', stock: -1, category: 'FOOD' }).expect(400);
  });

  it('returns 404 with standard error body for unknown id', async () => {
    const res = await request(app.getHttpServer()).delete('/products/unknown').expect(404);
    expect(res.body.code).toBe('PRODUCT_NOT_FOUND');
  });
});

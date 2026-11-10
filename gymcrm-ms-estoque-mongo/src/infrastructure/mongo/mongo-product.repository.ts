import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Product, ProductCategory } from '../../domain/product.entity';
import { ListOptions, ProductRepository } from '../../domain/product.repository';
import { MongoConnection, ProductDocument } from './mongo.connection';

function toDomain(doc: ProductDocument): Product {
  return new Product(
    (doc._id as ObjectId).toHexString(),
    doc.name,
    doc.description,
    doc.price,
    doc.stock,
    doc.createdAt,
    (doc.category ?? 'OTHER') as ProductCategory,
    doc.minStock ?? 0,
  );
}

@Injectable()
export class MongoProductRepository implements ProductRepository {
  constructor(private readonly connection: MongoConnection) {}

  async create(product: Product): Promise<Product> {
    const collection = await this.connection.products();
    const doc: ProductDocument = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      minStock: product.minStock,
      createdAt: product.createdAt,
    };
    const result = await collection.insertOne(doc);
    return new Product(
      result.insertedId.toHexString(),
      product.name,
      product.description,
      product.price,
      product.stock,
      product.createdAt,
      product.category,
      product.minStock,
    );
  }

  async findById(id: string): Promise<Product | null> {
    if (!ObjectId.isValid(id)) return null;
    const collection = await this.connection.products();
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? toDomain(doc) : null;
  }

  async findAll(options: ListOptions): Promise<Product[]> {
    const collection = await this.connection.products();
    const docs = await collection
      .find()
      .sort({ createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit)
      .toArray();
    return docs.map(toDomain);
  }

  async findLowStock(options: ListOptions): Promise<Product[]> {
    const collection = await this.connection.products();
    const docs = await collection
      .find({ minStock: { $gt: 0 }, $expr: { $lte: ['$stock', '$minStock'] } })
      .sort({ stock: 1 })
      .skip(options.skip)
      .limit(options.limit)
      .toArray();
    return docs.map(toDomain);
  }

  async update(product: Product): Promise<Product | null> {
    if (!product.id || !ObjectId.isValid(product.id)) return null;
    const collection = await this.connection.products();
    const result = await collection.updateOne(
      { _id: new ObjectId(product.id) },
      {
        $set: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          minStock: product.minStock,
        },
      },
    );
    return result.matchedCount === 1 ? product : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const collection = await this.connection.products();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }
}

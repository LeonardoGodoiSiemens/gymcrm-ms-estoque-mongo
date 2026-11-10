import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Collection, Db, MongoClient } from 'mongodb';

export interface ProductDocument {
  _id?: import('mongodb').ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  minStock: number;
  createdAt: Date;
}

@Injectable()
export class MongoConnection implements OnModuleDestroy {
  private client?: MongoClient;
  private db?: Db;

  async products(): Promise<Collection<ProductDocument>> {
    if (!this.db) {
      const uri = process.env.MONGODB_URI;
      if (!uri) throw new Error('MONGODB_URI environment variable is not set');
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_DB ?? 'gymcrm_estoque');
    }
    return this.db.collection<ProductDocument>('products');
  }

  async ping(): Promise<boolean> {
    try {
      await (await this.products()).estimatedDocumentCount();
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.close();
  }
}

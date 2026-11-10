import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../domain/product.repository';
import { MongoConnection } from './mongo/mongo.connection';
import { MongoProductRepository } from './mongo/mongo-product.repository';

@Module({
  providers: [
    MongoConnection,
    MongoProductRepository,
    { provide: PRODUCT_REPOSITORY, useExisting: MongoProductRepository },
  ],
  exports: [PRODUCT_REPOSITORY, MongoConnection],
})
export class InfrastructureModule {}

import { Module } from '@nestjs/common';
import { CreateProductHandler } from '../application/features/create-product/create-product.handler';
import { DeleteProductHandler } from '../application/features/delete-product/delete-product.handler';
import { GetProductHandler } from '../application/features/get-product/get-product.handler';
import { ListLowStockProductsHandler } from '../application/features/list-low-stock-products/list-low-stock-products.handler';
import { ListProductsHandler } from '../application/features/list-products/list-products.handler';
import { UpdateProductHandler } from '../application/features/update-product/update-product.handler';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { HealthController } from './health.controller';
import { ProductsController } from './products.controller';

export const PRODUCT_HANDLERS = [
  CreateProductHandler, GetProductHandler, ListProductsHandler, UpdateProductHandler, DeleteProductHandler,
  ListLowStockProductsHandler,
];

@Module({
  imports: [InfrastructureModule],
  controllers: [ProductsController, HealthController],
  providers: [...PRODUCT_HANDLERS],
})
export class ProductsModule {}

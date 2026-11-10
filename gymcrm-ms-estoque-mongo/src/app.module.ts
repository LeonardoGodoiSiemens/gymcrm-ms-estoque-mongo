import { Module } from '@nestjs/common';
import { ProductsModule } from './api/products.module';

@Module({ imports: [ProductsModule] })
export class AppModule {}

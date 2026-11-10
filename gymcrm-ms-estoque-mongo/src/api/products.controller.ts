import {
  Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductHandler } from '../application/features/create-product/create-product.handler';
import { DeleteProductHandler } from '../application/features/delete-product/delete-product.handler';
import { GetProductHandler } from '../application/features/get-product/get-product.handler';
import { ListLowStockProductsHandler } from '../application/features/list-low-stock-products/list-low-stock-products.handler';
import { ListProductsHandler } from '../application/features/list-products/list-products.handler';
import { UpdateProductHandler } from '../application/features/update-product/update-product.handler';
import { ProductRequestDto, ProductResponseDto } from './dto/product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductHandler,
    private readonly getProduct: GetProductHandler,
    private readonly listProducts: ListProductsHandler,
    private readonly updateProduct: UpdateProductHandler,
    private readonly deleteProduct: DeleteProductHandler,
    private readonly listLowStock: ListLowStockProductsHandler,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra item de estoque' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() body: ProductRequestDto) {
    return this.createProduct.execute(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista itens de estoque (paginado)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.listProducts.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Lista itens com estoque baixo (saldo <= estoque mínimo) - alerta RF07' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  lowStock(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.listLowStock.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca item por id' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  get(@Param('id') id: string) {
    return this.getProduct.execute({ id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza item (entrada/saída ajusta o saldo em stock)' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() body: ProductRequestDto) {
    return this.updateProduct.execute({ id, ...body });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove item' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteProduct.execute({ id });
  }
}

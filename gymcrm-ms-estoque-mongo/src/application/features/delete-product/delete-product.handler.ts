import { Inject, Injectable } from '@nestjs/common';
import { ProductNotFoundError } from '../../../domain/errors';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../../domain/product.repository';

export interface DeleteProductCommand {
  id: string;
}

@Injectable()
export class DeleteProductHandler {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: ProductRepository) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    const deleted = await this.repository.delete(command.id);
    if (!deleted) throw new ProductNotFoundError(command.id);
  }
}

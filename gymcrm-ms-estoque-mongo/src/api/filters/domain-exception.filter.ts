import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DomainValidationError, ProductNotFoundError } from '../../domain/errors';

@Catch(DomainValidationError, ProductNotFoundError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const isNotFound = exception instanceof ProductNotFoundError;
    response.status(isNotFound ? 404 : 400).json({
      code: isNotFound ? 'PRODUCT_NOT_FOUND' : 'VALIDATION_ERROR',
      message: exception.message,
    });
  }
}

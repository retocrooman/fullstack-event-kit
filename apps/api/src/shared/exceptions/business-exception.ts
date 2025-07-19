import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    error?: string,
    details?: any,
  ) {
    super(
      {
        message,
        error: error || 'Business Error',
        details,
      },
      statusCode,
    );
  }
}

export class ValidationException extends BusinessException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, 'Validation Error', details);
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND, 'Resource Not Found');
  }
}

export class DuplicateResourceException extends BusinessException {
  constructor(resource: string, field?: string, value?: string) {
    const message = field && value
      ? `${resource} with ${field} '${value}' already exists`
      : `${resource} already exists`;
    super(message, HttpStatus.CONFLICT, 'Duplicate Resource');
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }
}

export class ForbiddenException extends BusinessException {
  constructor(message: string = 'Access forbidden') {
    super(message, HttpStatus.FORBIDDEN, 'Forbidden');
  }
}

export class ServiceUnavailableException extends BusinessException {
  constructor(service: string, reason?: string) {
    const message = reason
      ? `${service} is currently unavailable: ${reason}`
      : `${service} is currently unavailable`;
    super(message, HttpStatus.SERVICE_UNAVAILABLE, 'Service Unavailable');
  }
}

export class DataIntegrityException extends BusinessException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, 'Data Integrity Error', details);
  }
}
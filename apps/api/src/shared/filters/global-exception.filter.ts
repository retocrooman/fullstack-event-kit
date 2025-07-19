import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = undefined;

    // Handle HttpException (includes NestJS built-in exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || error;
        details = responseObj.details;
      }
    }
    // Handle Prisma exceptions
    else if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          error = 'Conflict';
          message = 'Unique constraint violation';
          details = {
            code: exception.code,
            meta: exception.meta,
          };
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          error = 'Not Found';
          message = 'Record not found';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          error = 'Bad Request';
          message = 'Foreign key constraint violation';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          error = 'Bad Request';
          message = 'Database operation failed';
          details = {
            code: exception.code,
            meta: exception.meta,
          };
      }
    }
    // Handle generic Error
    else if (exception instanceof Error) {
      message = exception.message;

      // Check for specific error patterns
      if (message.includes('User already exists') || message.includes('already exists')) {
        status = HttpStatus.CONFLICT;
        error = 'Conflict';
      } else if (message.includes('not found') || message.includes('Not found')) {
        status = HttpStatus.NOT_FOUND;
        error = 'Not Found';
      } else if (message.includes('Invalid') || message.includes('invalid')) {
        status = HttpStatus.BAD_REQUEST;
        error = 'Bad Request';
      } else if (message.includes('Unauthorized') || message.includes('unauthorized')) {
        status = HttpStatus.UNAUTHORIZED;
        error = 'Unauthorized';
      }
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Send response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }
}

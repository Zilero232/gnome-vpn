import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { isObjectType } from 'remeda';

import { isPrismaRequestError } from '@/core';

import { PRISMA_ERROR_RESPONSE, STATUS_TO_CODE } from './all-exceptions.constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const hasCode = isObjectType(res) && 'code' in res;
      const status = exception.getStatus();

      response.status(status).json(hasCode ? res : { error: exception.message, code: STATUS_TO_CODE[status] ?? 'INTERNAL_ERROR' });

      return;
    }

    if (isPrismaRequestError(exception)) {
      const mapped = PRISMA_ERROR_RESPONSE[exception.code];

      if (mapped) {
        response.status(mapped.status).json({ error: mapped.code, code: mapped.code });

        return;
      }
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

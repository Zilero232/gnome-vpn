import type { ApiErrorCode } from '@gnomevpn/schemas';

import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException
} from '@nestjs/common';

import type { AppErrorBody } from './app.exception.types';

const body = ({ code, error }: AppErrorBody) => ({ error, code });

export class AppNotFoundException extends NotFoundException {
  constructor(code: ApiErrorCode, error: string) {
    super(body({ code, error }));
  }
}

export class AppForbiddenException extends ForbiddenException {
  constructor(code: ApiErrorCode, error: string) {
    super(body({ code, error }));
  }
}

export class AppUnauthorizedException extends UnauthorizedException {
  constructor(code: ApiErrorCode, error: string) {
    super(body({ code, error }));
  }
}

export class AppBadRequestException extends BadRequestException {
  constructor(code: ApiErrorCode, error: string) {
    super(body({ code, error }));
  }
}

export class AppPaymentRequiredException extends HttpException {
  constructor(code: ApiErrorCode, error: string) {
    super(body({ code, error }), HttpStatus.PAYMENT_REQUIRED);
  }
}

export class AppServiceUnavailableException extends ServiceUnavailableException {
  constructor(code: ApiErrorCode, error: string) {
    super(body({ code, error }));
  }
}

import type { ApiErrorCode } from '@gnomevpn/schemas';

import { HttpStatus } from '@nestjs/common';

import { PRISMA_ERROR } from '@/core';

export const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_FAILED',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.PAYMENT_REQUIRED]: 'PAYMENT_REQUIRED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN'
};

export const PRISMA_ERROR_RESPONSE: Record<string, { status: number; code: ApiErrorCode }> = {
  [PRISMA_ERROR.notFound]: { status: HttpStatus.NOT_FOUND, code: 'NOT_FOUND' },
  [PRISMA_ERROR.uniqueViolation]: { status: HttpStatus.CONFLICT, code: 'CONFLICT' }
};

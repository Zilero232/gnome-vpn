import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { AppBadRequestException, AppNotFoundException } from '@/common/exceptions';

import { describeError, errorCodeOf } from '../errors';

describe('describeError', () => {
  it('returns the string response of an http exception', () => {
    expect(describeError(new HttpException('node unreachable', HttpStatus.BAD_GATEWAY))).toBe('node unreachable');
  });

  it('serializes an object response of an http exception', () => {
    const error = new HttpException({ code: 'NODE_UNAVAILABLE', message: 'down' }, HttpStatus.SERVICE_UNAVAILABLE);

    expect(describeError(error)).toBe('{"code":"NODE_UNAVAILABLE","message":"down"}');
  });

  it('serializes the response nest builds for a shorthand exception', () => {
    expect(describeError(new NotFoundException('missing'))).toBe('{"message":"missing","error":"Not Found","statusCode":404}');
  });

  it('returns the message of a plain error', () => {
    expect(describeError(new Error('boom'))).toBe('boom');
  });

  it('returns the message of a subclassed error', () => {
    expect(describeError(new TypeError('not a function'))).toBe('not a function');
  });

  it('stringifies null', () => {
    expect(describeError(null)).toBe('null');
  });

  it('stringifies undefined', () => {
    expect(describeError(undefined)).toBe('undefined');
  });

  it('stringifies a plain object', () => {
    expect(describeError({ code: 500 })).toBe('[object Object]');
  });

  it('stringifies a primitive', () => {
    expect(describeError(42)).toBe('42');
  });

  it('stringifies an empty string', () => {
    expect(describeError('')).toBe('');
  });
});

describe('errorCodeOf', () => {
  it('reads the code back out of an app exception', () => {
    expect(errorCodeOf(new AppBadRequestException('TELEGRAM_CODE_INVALID', 'nope'))).toBe('TELEGRAM_CODE_INVALID');
    expect(errorCodeOf(new AppNotFoundException('NOT_FOUND', 'nope'))).toBe('NOT_FOUND');
  });

  it('returns null for an http exception carrying no code', () => {
    expect(errorCodeOf(new HttpException('plain', HttpStatus.BAD_REQUEST))).toBeNull();
  });

  it('returns null for a body whose code is not one we publish', () => {
    expect(errorCodeOf(new HttpException({ error: 'nope', code: 'MADE_UP' }, HttpStatus.BAD_REQUEST))).toBeNull();
  });

  it('returns null for anything that is not an http exception', () => {
    expect(errorCodeOf(new Error('boom'))).toBeNull();
    expect(errorCodeOf('boom')).toBeNull();
    expect(errorCodeOf(null)).toBeNull();
    expect(errorCodeOf(undefined)).toBeNull();
  });
});

import { Prisma } from '@/generated';

import { PRISMA_ERROR } from './prisma.constants';

export type PrismaRequestError = Prisma.PrismaClientKnownRequestError;

export const isPrismaRequestError = (error: unknown): error is PrismaRequestError => error instanceof Prisma.PrismaClientKnownRequestError;

export const isUniqueViolation = (error: unknown): boolean => isPrismaRequestError(error) && error.code === PRISMA_ERROR.uniqueViolation;

export const isSerializationFailure = (error: unknown): boolean => isPrismaRequestError(error) && error.code === PRISMA_ERROR.serializationFailure;

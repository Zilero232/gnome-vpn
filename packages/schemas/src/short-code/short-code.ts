import { SHORT_CODE } from './short-code.constants';

const SHAPE = new RegExp(`^[${SHORT_CODE.alphabet}]{${SHORT_CODE.length}}$`, 'u');

export const normaliseShortCode = (raw: string): string => raw.trim().toUpperCase().replaceAll(/\s+/gu, '');

export const isShortCode = (raw: string): boolean => SHAPE.test(normaliseShortCode(raw));

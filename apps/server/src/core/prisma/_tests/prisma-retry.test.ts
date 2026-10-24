import { describe, expect, it, vi } from 'vitest';

import { Prisma } from '@/generated';

import { withUniqueRetry } from '../prisma-retry';
import { PRISMA_ERROR } from '../prisma.constants';

const uniqueViolation = () => new Prisma.PrismaClientKnownRequestError('unique', { code: PRISMA_ERROR.uniqueViolation, clientVersion: 'test' });

describe('withUniqueRetry', () => {
  it('runs once more after a unique violation, which is what a lost upsert race throws', async () => {
    const run = vi.fn<() => Promise<string>>().mockRejectedValueOnce(uniqueViolation()).mockResolvedValueOnce('row');

    await expect(withUniqueRetry(run)).resolves.toBe('row');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('does not retry any other failure', async () => {
    const run = vi.fn<() => Promise<string>>().mockRejectedValue(new Error('down'));

    await expect(withUniqueRetry(run)).rejects.toThrow('down');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('gives up after one retry, so a real duplicate still surfaces', async () => {
    const run = vi.fn<() => Promise<string>>().mockRejectedValue(uniqueViolation());

    await expect(withUniqueRetry(run)).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    expect(run).toHaveBeenCalledTimes(2);
  });
});

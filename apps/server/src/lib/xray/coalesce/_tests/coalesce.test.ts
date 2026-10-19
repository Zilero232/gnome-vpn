import { afterEach, describe, expect, it, vi } from 'vitest';

import { coalesceByKey } from '../coalesce';

const deferred = () => {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;

  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

const runs: ReturnType<typeof deferred>[] = [];

const task = vi.fn(() => {
  const run = deferred();

  runs.push(run);

  return run.promise;
});

afterEach(async () => {
  for (const run of runs) {
    run.resolve();
  }

  await flush();

  runs.length = 0;
  task.mockClear();
});

describe('coalesceByKey', () => {
  it('runs the task at once when nothing is in flight', async () => {
    const done = coalesceByKey({ key: 'a', task });

    expect(task).toHaveBeenCalledTimes(1);

    runs[0].resolve();

    await expect(done).resolves.toBeUndefined();
  });

  it('folds every call made during a run into one follow-up run', async () => {
    const first = coalesceByKey({ key: 'b', task });
    const second = coalesceByKey({ key: 'b', task });
    const third = coalesceByKey({ key: 'b', task });

    expect(second).toBe(third);
    expect(task).toHaveBeenCalledTimes(1);

    runs[0].resolve();
    await first;
    await flush();

    expect(task).toHaveBeenCalledTimes(2);

    runs[1].resolve();

    await expect(second).resolves.toBeUndefined();
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('starts the follow-up only after the run in flight has finished', async () => {
    void coalesceByKey({ key: 'c', task });
    void coalesceByKey({ key: 'c', task });

    await flush();

    expect(task).toHaveBeenCalledTimes(1);
  });

  it('still runs the follow-up when the run in flight fails', async () => {
    const first = coalesceByKey({ key: 'd', task });
    const second = coalesceByKey({ key: 'd', task });

    runs[0].reject(new Error('restart failed'));

    await expect(first).rejects.toThrow('restart failed');
    await flush();

    runs[1].resolve();

    await expect(second).resolves.toBeUndefined();
  });

  it('runs again for a call made after everything settled', async () => {
    const first = coalesceByKey({ key: 'e', task });

    runs[0].resolve();
    await first;
    await flush();

    void coalesceByKey({ key: 'e', task });

    expect(task).toHaveBeenCalledTimes(2);
  });

  it('keeps different keys apart', () => {
    void coalesceByKey({ key: 'f', task });
    void coalesceByKey({ key: 'g', task });

    expect(task).toHaveBeenCalledTimes(2);
  });
});

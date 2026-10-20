import { describe, expect, it } from 'vitest';

import { feedTracker } from '../feed-tracker';

describe('feedTracker', () => {
  it('counts fetches per subscription token, so subscribers behind one CGNAT address do not share a budget', () => {
    expect(feedTracker({ params: { token: 'abc' }, ip: '100.64.0.1' })).toBe('token:abc');
    expect(feedTracker({ params: { token: 'xyz' }, ip: '100.64.0.1' })).not.toBe(feedTracker({ params: { token: 'abc' }, ip: '100.64.0.1' }));
  });

  it('falls back to the address when the route carries no token', () => {
    expect(feedTracker({ params: {}, ip: '203.0.113.7' })).toBe('ip:203.0.113.7');
  });
});

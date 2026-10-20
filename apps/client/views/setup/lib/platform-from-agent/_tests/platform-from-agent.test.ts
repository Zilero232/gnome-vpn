import { describe, expect, it } from 'vitest';

import { platformFromAgent } from '../platform-from-agent';

describe('platformFromAgent', () => {
  it.each([
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15', 'iphone'],
    ['Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36', 'android'],
    ['Mozilla/5.0 (Linux; Android 12; BRAVIA 4K VH2) AppleWebKit/537.36', 'tv'],
    ['Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36', 'tv'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36', 'computer'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15', 'computer']
  ])('reads %s as %s', (agent, platform) => {
    expect(platformFromAgent(agent)).toBe(platform);
  });
});

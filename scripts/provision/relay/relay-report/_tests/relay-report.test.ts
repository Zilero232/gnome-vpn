import { describe, expect, it } from 'vitest';

import { formatRelaySummary } from '../relay-report';
import { RELAY_REPORT } from '../relay-report.constants';

const provisioned = { host: '198.51.100.7', status: 'provisioned' as const, ports: [8443, 9443] };
const failed = { host: '198.51.100.8', status: 'failed' as const, ports: [8443], error: 'ssh refused' };

describe('formatRelaySummary', () => {
  it('names the relay, its status and every port it forwards', () => {
    const summary = formatRelaySummary([provisioned]);

    expect(summary).toContain(RELAY_REPORT.label);
    expect(summary).toContain(provisioned.host);
    expect(summary).toContain(provisioned.status);
    expect(summary).toContain(provisioned.ports.join(', '));
  });

  it('carries the error of a failed relay and nothing extra for a working one', () => {
    expect(formatRelaySummary([failed])).toContain(`(${failed.error})`);
    expect(formatRelaySummary([provisioned])).not.toContain('(');
  });

  it('gives one line per relay', () => {
    expect(formatRelaySummary([provisioned, failed]).split('\n')).toHaveLength(2);
  });
});

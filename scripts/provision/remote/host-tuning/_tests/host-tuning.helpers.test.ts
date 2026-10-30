import { describe, expect, it } from 'vitest';

import { JOURNALD, SYSCTL } from '../host-tuning.constants';
import { journaldConf, sysctlConf } from '../host-tuning.helpers';

describe('sysctlConf', () => {
  it('raises both socket buffer ceilings, which quic needs for hysteria2 under load', () => {
    const conf = sysctlConf();

    expect(conf).toContain(`net.core.rmem_max = ${SYSCTL.udpBufferBytes}`);
    expect(conf).toContain(`net.core.wmem_max = ${SYSCTL.udpBufferBytes}`);
  });

  it('pairs bbr with the fq queue discipline it is paced by', () => {
    const conf = sysctlConf();

    expect(conf).toContain(`net.ipv4.tcp_congestion_control = ${SYSCTL.congestionControl}`);
    expect(conf).toContain(`net.core.default_qdisc = ${SYSCTL.queueDiscipline}`);
  });

  it('ends with a newline', () => {
    expect(sysctlConf().endsWith('\n')).toBe(true);
  });
});

describe('journaldConf', () => {
  it('caps the journal under the section journald reads', () => {
    expect(journaldConf()).toBe(`[Journal]\nSystemMaxUse=${JOURNALD.maxUse}\n`);
  });
});

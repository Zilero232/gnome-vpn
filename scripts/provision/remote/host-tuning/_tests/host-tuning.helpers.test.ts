import { describe, expect, it } from 'vitest';

import { APT_JOBS, DOCKER_DAEMON, JOURNALD, SYSCTL, TIMESYNC } from '../host-tuning.constants';
import { aptServiceConf, aptTimerConf, dailyAt, dockerDaemonConf, dropInPath, journaldConf, sysctlConf, timesyncConf } from '../host-tuning.helpers';

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

  it('raises the default socket buffers too, which every outbound udp socket of xray gets', () => {
    const conf = sysctlConf();

    expect(conf).toContain(`net.core.rmem_default = ${SYSCTL.socketDefaultBytes}`);
    expect(conf).toContain(`net.core.wmem_default = ${SYSCTL.socketDefaultBytes}`);
  });

  it('probes the path mtu and keeps the window after an idle pause', () => {
    const conf = sysctlConf();

    expect(conf).toContain('net.ipv4.tcp_mtu_probing = 1');
    expect(conf).toContain('net.ipv4.tcp_slow_start_after_idle = 0');
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

describe('timesyncConf', () => {
  it('names reachable servers first and keeps the ubuntu pool only as a fallback', () => {
    expect(timesyncConf()).toBe(`[Time]\nNTP=${TIMESYNC.servers.join(' ')}\nFallbackNTP=${TIMESYNC.fallback.join(' ')}\n`);
  });
});

describe('aptTimerConf', () => {
  it('clears the stock schedule before setting the night one, or systemd would keep both', () => {
    const [unit] = APT_JOBS.units;
    const lines = aptTimerConf(unit).split('\n');

    expect(lines.indexOf('OnCalendar=')).toBeLessThan(lines.indexOf(`OnCalendar=${dailyAt(unit.time)}`));
  });

  it('downloads before it upgrades', () => {
    const [download, upgrade] = APT_JOBS.units;

    expect(download.name).toBe('apt-daily');
    expect(upgrade.name).toBe('apt-daily-upgrade');
    expect(download.time < upgrade.time).toBe(true);
  });
});

describe('aptServiceConf', () => {
  it('runs the updates at the lowest cpu and io priority, behind the tunnel', () => {
    const conf = aptServiceConf();

    expect(conf).toContain(`Nice=${APT_JOBS.nice}`);
    expect(conf).toContain(`CPUWeight=${APT_JOBS.cpuWeight}`);
    expect(conf).toContain(`IOWeight=${APT_JOBS.ioWeight}`);
  });
});

describe('dropInPath', () => {
  it('puts the override in the unit drop-in folder systemd reads', () => {
    expect(dropInPath('apt-daily.timer')).toBe(`/etc/systemd/system/apt-daily.timer.d/${APT_JOBS.dropIn}`);
  });
});

describe('dockerDaemonConf', () => {
  it('writes live-restore into a host that has no daemon.json yet', () => {
    expect(JSON.parse(dockerDaemonConf(''))).toEqual(DOCKER_DAEMON.settings);
  });

  it('keeps whatever else the host already configured', () => {
    expect(JSON.parse(dockerDaemonConf('{"dns": ["1.1.1.1"]}'))).toEqual({ dns: ['1.1.1.1'], ...DOCKER_DAEMON.settings });
  });

  it('refuses to overwrite a daemon.json it cannot read', () => {
    expect(() => dockerDaemonConf('["not", "an", "object"]')).toThrow();
    expect(() => dockerDaemonConf('{broken')).toThrow();
  });
});

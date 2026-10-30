import { JOURNALD, SYSCTL } from './host-tuning.constants';

export const sysctlConf = () =>
  [
    `net.core.rmem_max = ${SYSCTL.udpBufferBytes}`,
    `net.core.wmem_max = ${SYSCTL.udpBufferBytes}`,
    `net.core.default_qdisc = ${SYSCTL.queueDiscipline}`,
    `net.ipv4.tcp_congestion_control = ${SYSCTL.congestionControl}`,
    ''
  ].join('\n');

export const journaldConf = () => ['[Journal]', `SystemMaxUse=${JOURNALD.maxUse}`, ''].join('\n');

import { isNullish } from 'remeda';

import type { InboundPayloadInput, RequireInboundInput, XrayInbound, XrayInboundPayload } from './inbounds.types';

import { AppServiceUnavailableException } from '../../../common/exceptions';
import { INBOUND_REMARK } from './inbounds.constants';

const stringify = (value: unknown) => (isNullish(value) ? '' : JSON.stringify(value));

export const inboundPayload = ({ inbound, remark = INBOUND_REMARK }: InboundPayloadInput): XrayInboundPayload => ({
  ...inbound,
  remark,
  enable: true,
  port: inbound.port as number,
  protocol: inbound.protocol as string,
  settings: JSON.stringify(inbound.settings),
  streamSettings: stringify(inbound.streamSettings),
  sniffing: stringify(inbound.sniffing)
});

export const requireInbound = ({ inbounds, remark = INBOUND_REMARK }: RequireInboundInput): XrayInbound => {
  const inbound = inbounds.find((candidate) => candidate.remark === remark);

  if (isNullish(inbound)) {
    throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `no inbound remarked ${remark}`);
  }

  return inbound;
};

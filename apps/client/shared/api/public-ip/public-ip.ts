import type { ConnectionCheckInput } from '@gnomevpn/schemas';

import { connectionCheckSchema } from '@gnomevpn/schemas';
import axios from 'axios';

import { PUBLIC_IP } from './public-ip.constants';

export const getPublicIp = async (): Promise<ConnectionCheckInput> => {
  const { data } = await axios.get(PUBLIC_IP.url, { params: PUBLIC_IP.params, timeout: PUBLIC_IP.timeoutMs });

  return connectionCheckSchema.parse(data);
};

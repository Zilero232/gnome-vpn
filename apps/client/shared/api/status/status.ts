import type { ConnectionCheckInput, ConnectionResult, ServerStatus } from '@gnomevpn/schemas';

import { api } from '../http';

export const getServerStatus = async (): Promise<ServerStatus> => {
  const { data } = await api.get('/status');

  return data;
};

export const checkConnection = async (input: ConnectionCheckInput): Promise<ConnectionResult> => {
  const { data } = await api.post('/status/check', input);

  return data;
};

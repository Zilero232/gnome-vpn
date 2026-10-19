import type { CreateWireguardConfigInput, DeviceIdParam, WireguardConfigFile, WireguardOverview } from '@gnomevpn/schemas';

import { api } from '../http';

export const getWireguard = async (): Promise<WireguardOverview> => {
  const { data } = await api.get('/wireguard');

  return data;
};

export const createWireguardConfig = async (input: CreateWireguardConfigInput): Promise<WireguardConfigFile> => {
  const { data } = await api.post('/wireguard/configs', input);

  return data;
};

export const getWireguardConfig = async ({ id }: DeviceIdParam): Promise<WireguardConfigFile> => {
  const { data } = await api.get(`/wireguard/configs/${encodeURIComponent(id)}`);

  return data;
};

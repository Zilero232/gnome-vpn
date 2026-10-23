import type { RoutingSettings, UpdateRoutingSettingsInput } from '@gnomevpn/schemas';

import { api } from '../http';

export const getRoutingSettings = async (): Promise<RoutingSettings> => {
  const { data } = await api.get('/subscription-link/routing');

  return data;
};

export const updateRoutingSettings = async (input: UpdateRoutingSettingsInput): Promise<RoutingSettings> => {
  const { data } = await api.patch('/subscription-link/routing', input);

  return data;
};

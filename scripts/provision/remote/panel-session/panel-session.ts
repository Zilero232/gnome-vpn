import pWaitFor from 'p-wait-for';

import type { OpenPanelSessionInput, PanelSession, PanelUrlInput, WaitForPanelApiInput } from './panel-session.types';

import { log, PORTS } from '../../config';
import { isPanelReachable } from '../xray-panel';
import { PANEL_HEALTH } from './panel-session.constants';

const panelUrl = ({ host, panelPath }: PanelUrlInput) => `http://${host}:${PORTS.panel}/${panelPath}`;

const waitForPanelApi = async (credentials: WaitForPanelApiInput): Promise<boolean> =>
  pWaitFor(async () => (await isPanelReachable(credentials)) && pWaitFor.resolveWith(true), {
    timeout: { milliseconds: PANEL_HEALTH.timeoutMs, fallback: () => false },
    interval: PANEL_HEALTH.intervalMs
  });

export const openPanelSession = async ({ host, panelPath, token }: OpenPanelSessionInput): Promise<PanelSession> => {
  const baseUrl = panelUrl({ host, panelPath });

  log.step('waiting for the panel api');

  if (!(await waitForPanelApi({ baseUrl, token }))) {
    throw new Error('the panel never answered the api');
  }

  log.done('the panel api is reachable');

  return { baseUrl, token };
};

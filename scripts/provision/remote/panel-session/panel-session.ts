import pWaitFor, { TimeoutError } from 'p-wait-for';

import type { OpenPanelSessionInput, PanelSession, PanelUrlInput, WaitForPanelApiInput } from './panel-session.types';

import { log, PORTS } from '../../config';
import { isPanelReachable } from '../xray-panel';
import { PANEL_HEALTH } from './panel-session.constants';

const panelUrl = ({ host, panelPath }: PanelUrlInput) => `http://${host}:${PORTS.panel}/${panelPath}`;

const waitForPanelApi = async (credentials: WaitForPanelApiInput): Promise<boolean> => {
  try {
    await pWaitFor(() => isPanelReachable(credentials), {
      timeout: PANEL_HEALTH.timeoutMs,
      interval: PANEL_HEALTH.intervalMs
    });

    return true;
  } catch (error) {
    if (error instanceof TimeoutError) {
      return false;
    }

    throw error;
  }
};

export const openPanelSession = async ({ host, panelPath, token }: OpenPanelSessionInput): Promise<PanelSession> => {
  const baseUrl = panelUrl({ host, panelPath });

  log.step('waiting for the panel api');

  if (!(await waitForPanelApi({ baseUrl, token }))) {
    throw new Error('the panel never answered the api');
  }

  log.done('the panel api is reachable');

  return { baseUrl, token };
};

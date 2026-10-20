import type { z } from 'zod';

import type { ParsePanelReplyInput, TokenVerdict } from './panel-config.types';

import { CORE_SETTING, TOKEN_PROBE } from './panel-config.constants';
import { panelReplySchema, panelSettingsReplySchema } from './panel-config.schemas';

export const readJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export const parsePanelReply = <Schema extends z.ZodType<z.infer<typeof panelReplySchema>>>({
  raw,
  schema,
  action
}: ParsePanelReplyInput<Schema>): z.infer<Schema> => {
  const result = schema.safeParse(readJson(raw));

  if (!result.success) {
    throw new Error(`the panel gave an unreadable answer when asked to ${action}`);
  }

  if (!result.data.success) {
    throw new Error(`the panel refused to ${action}: ${result.data.msg ?? 'no reason given'}`);
  }

  return result.data;
};

export const settingsKeepingCore = (raw: string): string | null => {
  const { obj } = parsePanelReply({ raw, schema: panelSettingsReplySchema, action: 'read its settings' });

  if (Object.keys(obj).length === 0) {
    throw new Error('the panel returned no settings, refusing to write them back');
  }

  if (obj[CORE_SETTING.restartOnClientDisable] === false) {
    return null;
  }

  return JSON.stringify({ ...obj, [CORE_SETTING.restartOnClientDisable]: false });
};

export const assertPanelAccepted = (raw: string) => {
  parsePanelReply({ raw, schema: panelReplySchema, action: 'save its settings' });
};

export const readTokenProbe = (raw: string): TokenVerdict => {
  const split = raw.lastIndexOf('\n');
  const status = raw.slice(split + 1).trim();

  if (status === TOKEN_PROBE.rejectedStatus) {
    return 'rejected';
  }

  if (status !== TOKEN_PROBE.acceptedStatus) {
    throw new Error(`the panel answered the token check with http ${status || 'nothing'}, refusing to replace a token it may still accept`);
  }

  parsePanelReply({ raw: raw.slice(0, Math.max(split, 0)), schema: panelReplySchema, action: 'list its inbounds for the token we hold' });

  return 'accepted';
};

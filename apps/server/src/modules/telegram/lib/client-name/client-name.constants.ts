import type { ClientId } from '@gnomevpn/schemas';

import type { BotText } from '@/modules/telegram/telegram.types';

export const CLIENT_LABELS: Record<ClientId, string> = {
  incy: 'INCY',
  hiddify: 'Hiddify',
  v2rayng: 'v2rayNG',
  clashMeta: 'Clash Meta',
  streisand: 'Streisand',
  nekobox: 'NekoBox'
};

export const RECOMMENDED_MARK = '⭐';

export const CLIENT_PASTE: Record<ClientId, keyof BotText> = {
  incy: 'appsPasteIncy',
  hiddify: 'appsPasteHiddify',
  v2rayng: 'appsPasteV2rayng',
  clashMeta: 'appsPasteClashMeta',
  streisand: 'appsPasteStreisand',
  nekobox: 'appsPasteNekobox'
};

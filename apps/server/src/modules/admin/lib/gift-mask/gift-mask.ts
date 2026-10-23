import { ADMIN_GIFT, formatGiftCode } from '@gnomevpn/schemas';

export const maskGiftCode = (code: string): string => {
  const visible = Math.min(ADMIN_GIFT.visibleTail, code.length);

  return formatGiftCode(`${ADMIN_GIFT.mask.repeat(code.length - visible)}${code.slice(code.length - visible)}`);
};

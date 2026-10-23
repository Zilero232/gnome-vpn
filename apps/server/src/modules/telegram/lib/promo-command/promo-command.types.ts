import type { CreateCampaignInput } from '../../../promo-codes';

export type PromoCommand =
  { action: 'create'; input: CreateCampaignInput } | { action: 'list' } | { action: 'stop'; code: string } | { action: 'unknown' };

export type CampaignOptions = {
  effect: { kind: 'days'; days: number } | { kind: 'discount'; percent: number } | null;
  maxUses: number | null;
  expiresAt: Date | null;
};

export type ReadOptionInput = {
  token: string;
  options: CampaignOptions;
};

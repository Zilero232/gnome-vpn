export type CampaignEffect = { kind: 'days'; days: number } | { kind: 'discount'; percent: number };

export type CreateCampaignInput = CampaignEffect & {
  code: string;
  maxUses?: number | null;
  expiresAt?: Date | null;
};

export type CampaignProblem =
  'codeFormat' | 'codeLikeFriend' | 'codeLikeGift' | 'daysRange' | 'expiryInvalid' | 'expiryPast' | 'maxUsesRange' | 'percentRange';

export type CampaignProblemInput = {
  input: CreateCampaignInput;
  now: Date;
};

export type CampaignDraft = {
  code: string;
  kind: CampaignEffect['kind'];
  percent: number | null;
  days: number | null;
  maxUses: number | null;
  expiresAt: Date | null;
};

export type WithinInput = {
  value: number;
  min: number;
  max: number;
};

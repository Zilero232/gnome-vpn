export type CampaignStateInput = {
  expiresAt: Date | null;
  maxUses: number | null;
  used: number;
  now: Date;
};

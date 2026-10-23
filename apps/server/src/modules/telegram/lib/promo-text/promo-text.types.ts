import type { CampaignProblem, CampaignSummary, PromoCampaign } from '../../../promo-codes';
import type { BotLocale, BotText } from '../../telegram.types';

export type CampaignTextInput = {
  campaign: PromoCampaign;
  locale: BotLocale;
};

export type CampaignCreatedTextInput = CampaignTextInput & {
  link: string;
};

export type CampaignLineInput = {
  campaign: CampaignSummary;
  locale: BotLocale;
  now: Date;
};

export type CampaignListTextInput = {
  campaigns: CampaignSummary[];
  locale: BotLocale;
  now: Date;
};

export type CampaignProblemTextInput = {
  problem: CampaignProblem;
  locale: BotLocale;
};

export type CampaignProblemText = {
  key: keyof BotText;
  min?: number;
  max?: number;
};

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { many: string };

export type PluralizeInput = {
  count: number;
  forms: PluralForms;
  locale?: string;
};

export type TokenFill = Record<string, string>;

export type FillTokensInput = {
  text: string;
  fill: TokenFill;
};

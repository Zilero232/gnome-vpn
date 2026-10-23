export type ClaimInput = {
  code: string;
  isAsked: boolean;
};

export type OfferCleanup = (() => void) | undefined;

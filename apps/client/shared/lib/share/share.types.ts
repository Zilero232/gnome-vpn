export type ShareOrFallbackInput = {
  data: ShareData;
  fallback: () => Promise<unknown>;
};

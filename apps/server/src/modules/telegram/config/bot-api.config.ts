export const BOT_API = {
  timeoutSeconds: 15,
  init: { attempts: 4, backoffMs: 3_000 },
  calls: { retries: 3, backoffMs: 1_000, maxDelaySeconds: 10 }
} as const;

export const MESSAGE_EFFECT = {
  celebrate: '5046509860389126442',
  thumbsUp: '5107584321108051014'
} as const;

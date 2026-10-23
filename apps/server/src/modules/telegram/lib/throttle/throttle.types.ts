export type ThrottleInput = {
  key: string;
  now?: number;
};

export type Throttle = (input: ThrottleInput) => boolean;

export type RateLimitInput = {
  limit: number;
  windowMs: number;
};

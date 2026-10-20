export type ThrottleInput = {
  key: string;
  now?: number;
};

export type Throttle = (input: ThrottleInput) => boolean;

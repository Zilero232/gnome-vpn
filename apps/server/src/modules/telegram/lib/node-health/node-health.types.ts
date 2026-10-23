export type NodeStatus = 'down' | 'off' | 'up';

export type NodeAlertKind = 'down' | 'recovered';

export type NodeSilenceInput = {
  healthyAt: Date;
  now: Date;
};

export type NodeStatusInput = NodeSilenceInput & {
  isAvailable: boolean;
};

export type NodeAlertState = {
  isAnnouncedDown: boolean;
  downAlertedAt: Date | null;
};

export type NodeAlertInput = NodeSilenceInput & {
  state: NodeAlertState | undefined;
  isUp: boolean;
};

export type NodeAlertOutcome = {
  state: NodeAlertState;
  alert: NodeAlertKind | null;
};

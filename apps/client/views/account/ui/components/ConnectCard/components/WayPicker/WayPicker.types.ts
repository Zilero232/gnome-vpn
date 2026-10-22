import type { ConnectWay } from '../../ConnectCard.types';

export type WayPickerProps = {
  value: ConnectWay;
  onChange: (value: ConnectWay) => void;
};

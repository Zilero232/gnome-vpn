import type { ClientId, ClientLink } from '@gnomevpn/schemas';

export type ClientPickerProps = {
  clients: ClientLink[];
  value: ClientId;
  onChange: (value: ClientId) => void;
};

export type TelegramInviteProps = {
  isPending: boolean;
  isIssued: boolean;
  isExpired: boolean;
  onConnect: () => void;
};

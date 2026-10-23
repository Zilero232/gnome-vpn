export type OfferNoteKind = 'autoRenew' | 'payment';

export type OfferNoteProps = {
  kind: OfferNoteKind;
  className?: string;
};

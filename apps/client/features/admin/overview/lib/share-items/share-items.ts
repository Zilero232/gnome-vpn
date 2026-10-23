import { match, P } from 'ts-pattern';

import type { ShareItem, ShareItemsInput } from './share-items.types';

export const shareItems = ({ shares, labels, nameOf = (label) => label }: ShareItemsInput): ShareItem[] =>
  shares.map((share, index) => ({
    key: `${index}-${share.label ?? ''}`,
    value: share.count,
    label: match(share)
      .with({ isOther: true }, () => labels.other)
      .with({ label: P.string }, ({ label }) => nameOf(label))
      .otherwise(() => labels.unknown)
  }));

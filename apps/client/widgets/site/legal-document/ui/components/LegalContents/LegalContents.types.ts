export type LegalContentsItem = {
  id: string;
  title: string;
};

export type LegalContentsProps = {
  items: LegalContentsItem[];
  variant: 'aside' | 'inline';
};

export type OgImageProps = {
  params: Promise<{ locale: string }>;
};

export type OgFontInput = {
  name: string;
  file: Promise<Buffer>;
};

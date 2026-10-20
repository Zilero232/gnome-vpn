export type PanelSession = {
  baseUrl: string;
  token: string;
};

export type OpenPanelSessionInput = {
  host: string;
  panelPath: string;
  token: string;
};

export type PanelUrlInput = {
  host: string;
  panelPath: string;
};

export type WaitForPanelApiInput = {
  baseUrl: string;
  token: string;
};

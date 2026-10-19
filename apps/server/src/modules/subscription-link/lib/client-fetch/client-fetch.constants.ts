export const NON_CLIENT = {
  acceptHeader: 'accept',
  browserAgent: /^Mozilla\//u,
  htmlAccept: 'text/html',
  previewAgent: /bot\b|crawler|spider|preview|facebookexternalhit|whatsapp|viber|vkshare|skypeuripreview/iu
} as const;

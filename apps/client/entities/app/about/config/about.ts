export const ABOUT_STORY = ['problem', 'protocol', 'noLogs', 'infrastructure', 'client'] as const;

export const ABOUT_CLOSING = 'honesty' as const;

export const ABOUT_SECTIONS = [...ABOUT_STORY, ABOUT_CLOSING] as const;

export const ABOUT_FACTS = ['protocol', 'transport', 'clientApp', 'logs'] as const;

export type AboutSection = (typeof ABOUT_SECTIONS)[number];

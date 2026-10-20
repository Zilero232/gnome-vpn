import { createTranslator } from 'next-intl';

import { ABOUT_SECTIONS } from '@/entities/app/about';
import { FAQ_ANSWER_VALUES, FAQ_GROUPS } from '@/entities/app/faq';
import { SITE } from '@/shared/config';
import { DEFAULT_LOCALE, messages } from '@/shared/i18n';

import { LLMS_CONTENT_TYPE } from '../llms.txt/llms.constants';

export const GET = () => {
  const { about, faq } = messages[DEFAULT_LOCALE];
  const t = createTranslator({ locale: DEFAULT_LOCALE, messages: messages[DEFAULT_LOCALE], namespace: 'faq' });

  const sections = ABOUT_SECTIONS.flatMap((section) => [`### ${about.sections[section].title}`, '', about.sections[section].body, '']);

  const questions = FAQ_GROUPS.flatMap(({ key, questions: group }) => [
    `### ${faq.groups[key]}`,
    '',
    ...group.flatMap((question) => [`**${faq.questions[question].q}**`, '', t(`questions.${question}.a`, FAQ_ANSWER_VALUES), ''])
  ]);

  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    '## О сервисе',
    '',
    about.intro,
    '',
    ...sections,
    '## Вопросы и ответы',
    '',
    ...questions,
    '## Контакты',
    '',
    `- Поддержка: ${SITE.email}`,
    `- Сайт: ${SITE.url}`
  ];

  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': LLMS_CONTENT_TYPE } });
};

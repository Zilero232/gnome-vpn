import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'react-email';

import { EMAIL_TEXT } from '@/lib/email/email-text';

import type { BaseEmailProps } from './BaseEmail.types';

import { emailStyles } from '../email-styles';

export const BaseEmail = ({ locale, preview, heading, action, footer, unsubscribe, children }: BaseEmailProps) => (
  <Html lang={locale}>
    <Head />
    <Preview>{preview}</Preview>

    <Body style={emailStyles.body}>
      <Container style={emailStyles.outer}>
        <Section style={emailStyles.card}>
          <Text style={emailStyles.brand}>GnomeVPN</Text>
          <Heading style={emailStyles.heading}>{heading}</Heading>

          {children}

          {action ? (
            <>
              <Section style={{ paddingTop: '18px' }}>
                <Button href={action.url} style={emailStyles.button}>
                  {action.label}
                </Button>
              </Section>

              <Hr style={emailStyles.hr} />

              <Text style={emailStyles.footnote}>
                {EMAIL_TEXT[locale].common.fallbackLink}{' '}
                <Link href={action.url} style={emailStyles.link}>
                  {action.url}
                </Link>
              </Text>
            </>
          ) : null}

          {footer ? <Text style={emailStyles.footnote}>{footer}</Text> : null}

          {unsubscribe ? (
            <Text style={emailStyles.footnote}>
              {EMAIL_TEXT[locale].common.unsubscribe}{' '}
              <Link href={unsubscribe.url} style={emailStyles.link}>
                {unsubscribe.label}
              </Link>
            </Text>
          ) : null}
        </Section>
      </Container>
    </Body>
  </Html>
);

import { describe, expect, it } from 'vitest';

import { BOT_COMMANDS, CALLBACK_PREFIX } from '@/modules/telegram/config';
import { NOTICES } from '@/modules/telegram/notify/notify.config';
import { KEYBOARD_ROWS } from '@/modules/telegram/shared/keyboard';

import type { BotAction } from '../bot.types';

import { ANY_CHAT_ROUTES, OWNER_ROUTES, READER_ROUTES, WEBHOOK } from '../bot.config';
import { webhookUrl } from '../bot.helpers';

const actions: readonly BotAction[] = READER_ROUTES.actions;

const handled = new Set(actions.flatMap((action) => (action.button ? [action.button] : [])));

const readerCommands = actions.flatMap((action) => (action.command ? [action.command] : []));

const served = `/${WEBHOOK.path}`;

describe('bot actions', () => {
  it('handles every button the keyboard can show, so no press is silently ignored', () => {
    for (const { key } of KEYBOARD_ROWS.main.flat()) {
      expect(handled.has(key)).toBe(true);
    }
  });

  it('handles every button of the More menu, which reaches the same actions through a callback', () => {
    for (const { key } of KEYBOARD_ROWS.more.flat()) {
      expect(handled.has(key)).toBe(true);
    }
  });

  it('handles every button a notice can carry', () => {
    for (const { markup } of Object.values(NOTICES)) {
      for (const key of markup === 'main' ? [] : markup) {
        expect(handled.has(key)).toBe(true);
      }
    }
  });

  it('names each command once, because grammY would keep only the last handler', () => {
    expect(new Set(readerCommands).size).toBe(readerCommands.length);
  });
});

describe('owner commands', () => {
  const ownerCommands: readonly string[] = OWNER_ROUTES.commands;

  it('names each owner command once', () => {
    expect(new Set(ownerCommands).size).toBe(ownerCommands.length);
  });

  it('never shadows a command a reader has, since the admin chat may be the owner’s own private chat', () => {
    const reader = new Set([...readerCommands, 'start', ANY_CHAT_ROUTES.chatIdCommand]);

    for (const command of ownerCommands) {
      expect(reader.has(command), command).toBe(false);
    }
  });

  it('stays out of the public command menu', () => {
    const menu = new Set(BOT_COMMANDS.ru.map((entry) => entry.command));

    for (const command of ownerCommands) {
      expect(menu.has(command), command).toBe(false);
    }
  });
});

describe('callback routes', () => {
  it('routes every prefix exactly once, to the reader or to the owner', () => {
    const routed = [...READER_ROUTES.callbacks, ...OWNER_ROUTES.callbacks].sort();

    expect(routed).toEqual(Object.keys(CALLBACK_PREFIX).sort());
  });
});

describe('webhookUrl', () => {
  it('points at the path the controller serves', () => {
    expect(new URL(webhookUrl('https://bot.gnome-vpn.com')).pathname).toBe(served);
  });

  it('lands on the same path whatever the base carries after the host', () => {
    for (const base of ['https://bot.gnome-vpn.com/', 'https://bot.gnome-vpn.com/prefix', 'https://bot.gnome-vpn.com/prefix/']) {
      expect(new URL(webhookUrl(base)).pathname).toBe(served);
    }
  });

  it('keeps the host it was given', () => {
    expect(new URL(webhookUrl('https://bot.gnome-vpn.com/anything')).host).toBe('bot.gnome-vpn.com');
  });
});

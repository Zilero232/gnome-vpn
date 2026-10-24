import { describe, expect, it } from 'vitest';

import { BOT_COMMANDS, CALLBACK_PREFIX, CHAT_ID_COMMAND, KEYBOARD_ROWS, MORE_ROWS, NOTICES } from '@/modules/telegram/config';

import type { TelegramBotService } from '../telegram-bot.service';

import { TelegramBotService as Bot } from '../telegram-bot.service';

const botOf = (): TelegramBotService => Object.create(Bot.prototype) as TelegramBotService;

const actionsOf = (): TelegramBotService['actions'] => botOf().actions;

describe('bot actions', () => {
  it('handles every button the keyboard can show, so no press is silently ignored', () => {
    const handled = new Set(actionsOf().flatMap((action) => (action.button ? [action.button] : [])));

    for (const { key } of KEYBOARD_ROWS.flat()) {
      expect(handled.has(key)).toBe(true);
    }
  });

  it('handles every button of the More menu, which reaches the same actions through a callback', () => {
    const handled = new Set(actionsOf().flatMap((action) => (action.button ? [action.button] : [])));

    for (const { key } of MORE_ROWS.flat()) {
      expect(handled.has(key)).toBe(true);
    }
  });

  it('handles every button a notice can carry', () => {
    const handled = new Set(actionsOf().flatMap((action) => (action.button ? [action.button] : [])));

    for (const { markup } of Object.values(NOTICES)) {
      for (const key of markup === 'main' ? [] : markup) {
        expect(handled.has(key)).toBe(true);
      }
    }
  });

  it('names each command once, because grammY would keep only the last handler', () => {
    const commands = actionsOf().flatMap((action) => (action.command ? [action.command] : []));

    expect(new Set(commands).size).toBe(commands.length);
  });

  it('gives every action something to run', () => {
    for (const action of actionsOf()) {
      expect(typeof action.run).toBe('function');
    }
  });
});

describe('owner commands', () => {
  const ownerCommands = (): string[] => botOf().ownerActions.map((action) => action.command);

  it('names each owner command once', () => {
    expect(new Set(ownerCommands()).size).toBe(ownerCommands().length);
  });

  it('never shadows a command a reader has, since the admin chat may be the owner’s own private chat', () => {
    const readerCommands = new Set([...actionsOf().flatMap((action) => (action.command ? [action.command] : [])), 'start', CHAT_ID_COMMAND]);

    for (const command of ownerCommands()) {
      expect(readerCommands.has(command), command).toBe(false);
    }
  });

  it('stays out of the public command menu', () => {
    const menu = new Set(BOT_COMMANDS.ru.map((entry) => entry.command));

    for (const command of ownerCommands()) {
      expect(menu.has(command), command).toBe(false);
    }
  });

  it('gives each owner button prefix its own handler, apart from the reader’s buttons', () => {
    const prefixes = botOf().ownerCallbacks.map((callback) => callback.prefix);
    const known = new Set<string>(Object.values(CALLBACK_PREFIX));

    for (const prefix of prefixes) {
      expect(known.has(prefix), prefix).toBe(true);
    }

    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});

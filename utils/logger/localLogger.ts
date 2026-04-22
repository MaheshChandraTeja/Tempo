import type { DebugTag } from '@/utils/logger/debugTags';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = Readonly<{
  id: string;
  timestamp: string;
  level: LogLevel;
  tag: DebugTag | string;
  message: string;
  context?: unknown;
}>;

export type LoggerOptions = Readonly<{
  enabled?: boolean;
  maxEntries?: number;
  echoToConsole?: boolean;
}>;

const DEFAULT_OPTIONS: Required<LoggerOptions> = Object.freeze({
  enabled: __DEV__,
  maxEntries: 250,
  echoToConsole: __DEV__,
});

let config: Required<LoggerOptions> = DEFAULT_OPTIONS;
let buffer: LogEntry[] = [];

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function emitToConsole(entry: LogEntry): void {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.tag}] ${entry.message}`;

  switch (entry.level) {
    case 'debug':
      console.debug(prefix, entry.context ?? '');
      break;
    case 'info':
      console.info(prefix, entry.context ?? '');
      break;
    case 'warn':
      console.warn(prefix, entry.context ?? '');
      break;
    case 'error':
      console.error(prefix, entry.context ?? '');
      break;
    default: {
      const exhaustiveCheck: never = entry.level;
      console.log(exhaustiveCheck);
    }
  }
}

function pushEntry(entry: LogEntry): void {
  if (!config.enabled) {
    return;
  }

  buffer = [...buffer, entry].slice(-config.maxEntries);

  if (config.echoToConsole) {
    emitToConsole(entry);
  }
}

function createEntry(
  level: LogLevel,
  tag: DebugTag | string,
  message: string,
  context?: unknown,
): LogEntry {
  return Object.freeze({
    id: createId(),
    timestamp: new Date().toISOString(),
    level,
    tag,
    message,
    context,
  });
}

export const localLogger = Object.freeze({
  configure(options: LoggerOptions): void {
    config = {
      ...config,
      ...options,
    };
  },

  reset(): void {
    config = DEFAULT_OPTIONS;
    buffer = [];
  },

  clear(): void {
    buffer = [];
  },

  getEntries(): readonly LogEntry[] {
    return buffer;
  },

  debug(tag: DebugTag | string, message: string, context?: unknown): void {
    pushEntry(createEntry('debug', tag, message, context));
  },

  info(tag: DebugTag | string, message: string, context?: unknown): void {
    pushEntry(createEntry('info', tag, message, context));
  },

  warn(tag: DebugTag | string, message: string, context?: unknown): void {
    pushEntry(createEntry('warn', tag, message, context));
  },

  error(tag: DebugTag | string, message: string, context?: unknown): void {
    pushEntry(createEntry('error', tag, message, context));
  },
});
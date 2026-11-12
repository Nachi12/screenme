const REDACTED_KEYS = new Set([
  'password',
  'passwordhash',
  'rawtext',
  'resumetext',
  'text',
  'email',
  'phone',
  'token',
  'resettoken',
  'authorization',
  'cookie',
  'geminiapikey',
  'apikey',
  'jwtsecret',
  'secret',
]);

function shouldRedactKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (REDACTED_KEYS.has(lower)) return true;
  return (
    lower.includes('password') ||
    lower.includes('secret') ||
    lower.includes('apikey') ||
    lower.includes('api_key') ||
    lower.endsWith('token')
  );
}

function redactObject(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > 300 ? `${value.slice(0, 120)}...[truncated]` : value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 10).map((item) => redactObject(item, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (shouldRedactKey(key)) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = redactObject(val, depth + 1);
      }
    }
    return out;
  }
  return value;
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const payload = meta ? ` ${JSON.stringify(redactObject(meta))}` : '';
    console.info(`[INFO] ${new Date().toISOString()} ${message}${payload}`);
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    const payload = meta ? ` ${JSON.stringify(redactObject(meta))}` : '';
    console.warn(`[WARN] ${new Date().toISOString()} ${message}${payload}`);
  },
  error(message: string, meta?: Record<string, unknown>): void {
    const payload = meta ? ` ${JSON.stringify(redactObject(meta))}` : '';
    console.error(`[ERROR] ${new Date().toISOString()} ${message}${payload}`);
  },
};


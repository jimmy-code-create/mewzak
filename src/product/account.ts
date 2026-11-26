// A local account is a credential pair kept in this browser/app profile.
// There is no backend: the email is never sent, and the password is stored as a
// salted SHA-256 digest. It is the honest middle ground between a fake "Sign in
// with Google" button and a real cross-device account (see SETUP.md).

export type LocalAccount = {
  email: string;
  salt: string;
  passwordHash: string;
  createdAt: number;
};

const ACCOUNT_KEY = 'mewzak.account.v1';

export type AccountResult =
  | { ok: true; email: string }
  | { ok: false; error: 'exists' | 'no-account' | 'wrong-password' };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(value));
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fallbackHash(input: string): string {
  // Only reached on a non-secure context without Web Crypto. It keeps the local
  // record opaque; it is not a substitute for a server-side password hash.
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let index = 0; index < input.length; index += 1) {
    a = Math.imul(a ^ input.charCodeAt(index), 16777619) >>> 0;
    b = Math.imul(b + input.charCodeAt(index), 2246822519) >>> 0;
  }
  return `${a.toString(16)}${b.toString(16)}`.padStart(16, '0');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const payload = new TextEncoder().encode(`${salt}:${password}`);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const digest = await crypto.subtle.digest('SHA-256', payload);
      return bytesToHex(new Uint8Array(digest));
    } catch {
      /* fall through */
    }
  }
  return fallbackHash(`${salt}:${password}`);
}

function newSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(bytes);
}

export function loadLocalAccount(): LocalAccount | null {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalAccount>;
    if (
      typeof parsed.email !== 'string' ||
      typeof parsed.salt !== 'string' ||
      typeof parsed.passwordHash !== 'string'
    ) {
      return null;
    }
    return {
      email: parsed.email,
      salt: parsed.salt,
      passwordHash: parsed.passwordHash,
      createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function hasLocalAccount(): boolean {
  return loadLocalAccount() !== null;
}

export async function createLocalAccount(email: string, password: string): Promise<AccountResult> {
  const clean = normalizeEmail(email);
  if (loadLocalAccount()) return { ok: false, error: 'exists' };
  const salt = newSalt();
  const account: LocalAccount = {
    email: clean,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: Date.now(),
  };
  try {
    window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    return { ok: false, error: 'no-account' };
  }
  return { ok: true, email: clean };
}

export async function verifyLocalAccount(email: string, password: string): Promise<AccountResult> {
  const clean = normalizeEmail(email);
  const account = loadLocalAccount();
  if (!account || account.email !== clean) return { ok: false, error: 'no-account' };
  const digest = await hashPassword(password, account.salt);
  if (digest !== account.passwordHash) return { ok: false, error: 'wrong-password' };
  return { ok: true, email: clean };
}

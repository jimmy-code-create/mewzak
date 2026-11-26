/**
 * Auth adapter for the onboarding email step.
 *
 * SECURITY
 * --------
 * A password is only ever held in transient component memory for the duration of
 * the submit. It is never written to the saved onboarding session or any global
 * store. With no backend configured, the fallback keeps a salted SHA-256
 * credential in this device's localStorage so create/login can actually be
 * verified. Set VITE_AUTH_ENDPOINT to use a real signup/login service instead.
 */

import {
  createLocalAccount,
  verifyLocalAccount,
} from '../product/account';

export type AuthMode = 'create' | 'login';

export type AuthResult =
  | { ok: true }
  | { ok: false; message: string };

const AUTH_ENDPOINT = (import.meta.env.VITE_AUTH_ENDPOINT as string | undefined)?.trim();

function normalizeMessage(value: unknown, fallback: string) {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

/**
 * submitAuth(email, password, mode)
 *
 * The UI calls this only after local validation passes. The password is passed
 * through and then dropped; nothing in this module retains it.
 */
export async function submitAuth(
  email: string,
  password: string,
  mode: AuthMode = 'create',
): Promise<AuthResult> {
  if (AUTH_ENDPOINT) {
    const path = mode === 'create' ? 'signup' : 'login';
    try {
      const response = await fetch(`${AUTH_ENDPOINT.replace(/\/$/, '')}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const payload: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
        return {
          ok: false,
          message: normalizeMessage(record.message ?? record.error, 'That account could not be opened.'),
        };
      }
      return { ok: true };
    } catch {
      return {
        ok: false,
        message: 'The account service did not answer. Check your connection and try again.',
      };
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * LOCAL FALLBACK (no backend configured).
   *
   * One email/password account per device, stored as a random salt plus a
   * SHA-256 digest in localStorage. Create and login both verify against that
   * record, so the onboarding is not a fake success. This is not cross-device
   * sync and cannot send password resets. Set VITE_AUTH_ENDPOINT to replace it
   * with a real service:
   *
   *   POST {endpoint}/signup and POST {endpoint}/login, accepting
   *   { email, password } as JSON. Return 2xx on success and
   *   { message } or { error } on failure. Use HTTPS and rate limiting.
   *
   * Do not log the password or send it over plain HTTP. A hosted provider
   * (Supabase Auth, Firebase Auth) also works here.
   * ────────────────────────────────────────────────────────────────────────── */
  await new Promise((resolve) => window.setTimeout(resolve, 650));
  const result =
    mode === 'create'
      ? await createLocalAccount(email, password)
      : await verifyLocalAccount(email, password);
  if (result.ok) return { ok: true };
  return {
    ok: false,
    message:
      result.error === 'exists'
        ? 'An account already exists on this device. Log in instead.'
        : result.error === 'no-account'
          ? 'No account with that email on this device. Create one instead.'
          : 'That password does not match the account on this device.',
  };
}

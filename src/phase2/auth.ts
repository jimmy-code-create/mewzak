/**
 * Auth adapter for the onboarding email step.
 *
 * SECURITY
 * --------
 * A password is only ever held in transient component memory for the duration of
 * the submit. It is never written to localStorage, sessionStorage, the saved
 * onboarding session, or any global store.
 *
 * There is no account backend in this repository today. Set VITE_AUTH_ENDPOINT
 * to a real signup/login service to use the network path below, or replace the
 * clearly marked TODO block. See the end of this file for the expected contract.
 */

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
   * TODO(auth): NO BACKEND IS CONNECTED.
   *
   * This demo branch lets the onboarding UI be reviewed end to end. It does not
   * create an account and it does not authenticate anyone. Replace it with one of:
   *
   *   1. A backend endpoint (recommended): set VITE_AUTH_ENDPOINT and implement
   *      POST {endpoint}/signup and POST {endpoint}/login, accepting
   *      { email, password } as JSON. Return 2xx on success and
   *      { message } or { error } on failure. Use HTTPS and rate limiting.
   *   2. Supabase Auth: supabase.auth.signUp({ email, password }) /
   *      signInWithPassword({ email, password }).
   *   3. Firebase Auth: createUserWithEmailAndPassword / signInWithEmailAndPassword.
   *
   * Do not log the password, do not persist it, and do not send it anywhere over
   * plain HTTP. After a successful call, store only the session token the auth
   * provider returns (in an httpOnly cookie or the provider's own session store).
   * ────────────────────────────────────────────────────────────────────────── */
  await new Promise((resolve) => window.setTimeout(resolve, 900));
  return { ok: true };
}

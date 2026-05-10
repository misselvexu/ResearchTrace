/**
 * Lightweight client-side auth-state helper.
 *
 * NOTE: This is a UI-only stub for the prototype. It persists a sign-in flag
 * in `localStorage` so visitors who pass through /login or /signup are
 * routed to /today on next visit, while anonymous visitors land on
 * /landing. Replaces the previous unconditional redirect from "/".
 *
 * No PII is stored here — only a session flag.
 */

const KEY = "rt.session.v1";

export type Session = {
  authed: true;
  email?: string;
  name?: string;
  ts: number;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed || parsed.authed !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function signIn(input: { email?: string; name?: string } = {}): Session {
  const session: Session = { authed: true, ts: Date.now(), ...input };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(session));
    } catch {
      // ignore — third-party cookie / private mode
    }
  }
  return session;
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function isAuthed(): boolean {
  return getSession() !== null;
}

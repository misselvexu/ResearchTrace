"use client";

/**
 * RedirectIfAuthed — wrap public/auth pages (landing, login, signup) so
 * a user who is already signed in cannot see the marketing/auth UI by
 * mistake. Bounces them to /today.
 */

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/lib/auth";

export function RedirectIfAuthed({
  to = "/today",
  children,
}: {
  to?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthed()) {
      router.replace(to);
      return;
    }
    setReady(true);
  }, [router, to]);

  if (!ready) return null;
  return <>{children}</>;
}

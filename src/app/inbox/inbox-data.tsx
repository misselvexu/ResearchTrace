"use client";

/**
 * Inbox page — live counters overlay.
 *
 * The page's editorial item list shape (`type: PDF|URL|TWITTER|...`) does not
 * match the backend `InboxItem` discriminator (`kind: paper|discussion|...`).
 * Migrating the list rows is deferred to a later phase — for now we only
 * surface live counters in the dropzone strip via `GET /inbox/counters`.
 *
 * Failure mode: silently fall back to the editorial seed numbers (the
 * original page ships with `1 / 1 / 45 / 0 / 3` placeholders).
 */

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { InboxCounters } from "@/types/api";

export interface InboxLive {
  counters: InboxCounters | null;
  loading: boolean;
}

const EMPTY: InboxLive = { counters: null, loading: true };

export function useInboxCounters(): InboxLive {
  const [state, setState] = useState<InboxLive>(EMPTY);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    api
      .get<InboxCounters>("/inbox/counters", undefined, ctrl.signal)
      .then((c) => {
        if (alive) setState({ counters: c, loading: false });
      })
      .catch(() => {
        if (alive) setState({ counters: null, loading: false });
      });
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, []);

  return state;
}

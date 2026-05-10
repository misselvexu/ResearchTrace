/**
 * Search page — federated live overlay.
 *
 * The legacy /search page renders four group rails (briefs / claims / sources
 * / topics) backed entirely by editorial i18n arrays. To preserve that
 * scaffold while adding live data we run a federated query that fans out to
 * topicsQuery + briefsQuery + vaultQuery (claims & sources stay editorial —
 * those domains are tracked under separate phases).
 *
 * The hook returns `loading`, the federated counts, and per-group strings that
 * are merged into the editorial demos by the page. When the API returns
 * nothing (empty seeds, error, or empty query) the editorial fallback shines
 * through unchanged.
 */

"use client";

import { useEffect, useState } from "react";
import { federatedSearchQuery, type FederatedSearchResult } from "@/lib/queries";
import { pickLocale } from "../ask/ask-data";

export interface SearchLive {
  result: FederatedSearchResult | null;
  loading: boolean;
  error: string | null;
}

export function useFederatedSearch(query: string): SearchLive {
  const [state, setState] = useState<SearchLive>({
    result: null,
    loading: false,
    error: null,
  });
  useEffect(() => {
    if (!query.trim()) {
      setState({ result: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState((cur) => ({ ...cur, loading: true, error: null }));
    federatedSearchQuery(query)
      .then((result) => {
        if (cancelled) return;
        setState({ result, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState({
          result: null,
          loading: false,
          error: e instanceof Error ? e.message : "Search failed",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [query]);
  return state;
}

/** Derive bilingual one-liners from the federated result groups. */
export function deriveLiveLines(
  res: FederatedSearchResult | null,
  locale: string,
): { topics: string[]; briefs: string[]; sources: string[]; vault: string[] } {
  if (!res) return { topics: [], briefs: [], sources: [], vault: [] };
  return {
    topics: res.topics.map((t) => {
      const summary = t.summary ? pickLocale(t.summary, locale).slice(0, 80) : "";
      return summary ? `${pickLocale(t.name, locale)} — ${summary}` : pickLocale(t.name, locale);
    }),
    briefs: res.briefs.map((b) => {
      const headline = pickLocale(b.headline, locale);
      const deck = b.deck ? pickLocale(b.deck, locale).slice(0, 80) : "";
      return deck ? `${headline} — ${deck}` : headline;
    }),
    sources: [],
    vault: res.vault.map((v) => pickLocale(v.title, locale)),
  };
}

/**
 * Vault page — live overlay.
 *
 * The legacy /vault page renders a 12-card editorial grid backed entirely by
 * `vault.item.<k>.title|src` i18n keys. We preserve that scaffold (copywriter
 * owned) and overlay live data from `vaultQuery` and `vaultTagsQuery`:
 *
 *   - Stats row "total items" replaced with live `totalEstimate`
 *   - Search query forwarded to the API for debounce-free server filtering
 *   - Live items prepended ahead of the editorial seed grid
 *   - Tags directory drives a live cloud below the editorial filter pills
 *
 * Mutations:
 *   - exportVault({format}) → POST /vault/export
 *   - addVaultItem({title, body}) → POST /vault (defaults to a "note")
 */

"use client";

import { useEffect, useState } from "react";
import type {
  TagSummary,
  VaultExportFormat,
  VaultExportRequest,
  VaultExportResponse,
  VaultItem,
} from "@/types/api";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-api-error";
import { invalidate, vaultQuery, vaultTagsQuery } from "@/lib/queries";

export interface VaultLive {
  items: VaultItem[];
  total: number;
  tags: TagSummary[];
  loading: boolean;
}

const EMPTY: VaultLive = { items: [], total: 0, tags: [], loading: true };

export function useVaultLive(query: string): VaultLive {
  const [state, setState] = useState<VaultLive>(EMPTY);
  useEffect(() => {
    let cancelled = false;
    setState((cur) => ({ ...cur, loading: true }));
    Promise.allSettled([
      vaultQuery({ q: query.trim() || undefined, sort: "recent", limit: 24 }),
      vaultTagsQuery(),
    ]).then(([itemsR, tagsR]) => {
      if (cancelled) return;
      const items = itemsR.status === "fulfilled" ? itemsR.value : null;
      const tags = tagsR.status === "fulfilled" ? tagsR.value.tags : [];
      setState({
        items: items?.items ?? [],
        total: items?.totalEstimate ?? 0,
        tags,
        loading: false,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [query]);
  return state;
}

/** Trigger an async export job. The mock returns a job id immediately. */
export async function exportVault(
  format: VaultExportFormat,
  t: (k: string) => string,
): Promise<VaultExportResponse | null> {
  try {
    const res = await api.post<VaultExportResponse, VaultExportRequest>(
      "/vault/export",
      { format },
    );
    return res;
  } catch (e) {
    handleApiError(e, t);
    return null;
  }
}

/** Add a quick-note vault item. */
export async function addQuickNote(
  title: string,
  t: (k: string) => string,
): Promise<VaultItem | null> {
  try {
    const created = await api.post<VaultItem>("/vault", {
      kind: "note",
      title: { zh: title, en: title },
      body: { zh: "", en: "" },
    });
    invalidate(["vault"]);
    return created;
  } catch (e) {
    handleApiError(e, t);
    return null;
  }
}

/**
 * Vault Domain — saved knowledge base.
 *
 * The Vault is the user's personal, organized library of items they have
 * explicitly saved (papers, notes, briefs, web clips). It supports tagging,
 * folders (collections), full-text search, and export.
 *
 * Endpoints (see openapi/paths/vault.yaml):
 *   GET    /vault                            (list, paginated)
 *   POST   /vault                            (save an item — from inbox/web/manual)
 *   GET    /vault/{id}
 *   PATCH  /vault/{id}                       (rename, retag, move)
 *   DELETE /vault/{id}                       (move to trash)
 *   POST   /vault/{id}/restore               (un-trash)
 *   GET    /vault/collections
 *   POST   /vault/collections                (create folder)
 *   PATCH  /vault/collections/{id}
 *   DELETE /vault/collections/{id}
 *   GET    /vault/tags
 *   POST   /vault/{id}/note                  (add/update inline note)
 *   POST   /vault/export                     (async; returns job id → ZIP)
 */

import type {
  AuditFields,
  DocumentRef,
  LocalizedText,
  PageQuery,
  SortDirection,
  UserId,
  VaultItemId,
} from "./_shared";

// ============================================================================
// Item kinds — discriminated union (UI renders different cards per kind)
// ============================================================================

export type VaultItemKind = "paper" | "note" | "brief" | "clip" | "file";

export interface VaultItemBase extends AuditFields {
  id: VaultItemId;
  ownerId: UserId;
  kind: VaultItemKind;
  /** User-editable title (bilingual). */
  title: LocalizedText;
  /** User-attached note (markdown, bilingual; either side may be empty). */
  note: LocalizedText | null;
  /** Free-form tags (lowercase, deduped). */
  tags: string[];
  /** Collection IDs this item belongs to (many-to-many). */
  collectionIds: string[];
  /** True iff in trash (soft-delete). */
  trashed: boolean;
  /** Trash auto-purge timestamp; null when not trashed. */
  trashedAt: string | null;
  /** UI star/favorite flag. */
  starred: boolean;
}

export interface VaultItemPaper extends VaultItemBase {
  kind: "paper";
  document: DocumentRef;
  /** Whether the user has a local PDF cached server-side. */
  pdfStored: boolean;
}

export interface VaultItemNote extends VaultItemBase {
  kind: "note";
  /** Markdown body (bilingual). */
  body: LocalizedText;
  /** Word count (denormalized). */
  wordCount: number;
}

export interface VaultItemBrief extends VaultItemBase {
  kind: "brief";
  /** Reference to the underlying brief in Briefs domain. */
  briefId: string;
  /** Snapshot timestamp for the saved brief version. */
  snapshotAt: string;
}

export interface VaultItemClip extends VaultItemBase {
  kind: "clip";
  /** Original URL the clip was captured from. */
  sourceUrl: string;
  /** Plain-text excerpt (max ~5KB). */
  excerpt: string;
  /** Optional screenshot URL. */
  screenshotUrl: string | null;
}

export interface VaultItemFile extends VaultItemBase {
  kind: "file";
  /** Filename including extension. */
  filename: string;
  /** Content-Type. */
  mimeType: string;
  sizeBytes: number;
  /** CDN download URL (signed, short-lived; refresh via GET item endpoint). */
  downloadUrl: string;
}

export type VaultItem =
  | VaultItemPaper
  | VaultItemNote
  | VaultItemBrief
  | VaultItemClip
  | VaultItemFile;

// ============================================================================
// List query
// ============================================================================

export type VaultSort = "recent" | "alphabetical" | "added" | "lastOpened";

export interface ListVaultQuery extends PageQuery {
  sort?: VaultSort;
  direction?: SortDirection;
  q?: string;
  kind?: VaultItemKind;
  /** Filter by tag (any). */
  tag?: string;
  /** Filter by collection. */
  collectionId?: string;
  /** Default false — only show non-trashed. */
  includeTrashed?: boolean;
  starred?: boolean;
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * CreateVaultItemRequest — discriminated by `kind`.
 * Different shapes per kind ensure the backend gets exactly what it needs.
 */
export type CreateVaultItemRequest =
  | {
      kind: "paper";
      title: LocalizedText;
      document: DocumentRef;
      tags?: string[];
      collectionIds?: string[];
      note?: LocalizedText;
    }
  | {
      kind: "note";
      title: LocalizedText;
      body: LocalizedText;
      tags?: string[];
      collectionIds?: string[];
    }
  | {
      kind: "brief";
      title: LocalizedText;
      briefId: string;
      tags?: string[];
      collectionIds?: string[];
    }
  | {
      kind: "clip";
      title: LocalizedText;
      sourceUrl: string;
      excerpt: string;
      screenshotUrl?: string;
      tags?: string[];
      collectionIds?: string[];
    }
  | {
      kind: "file";
      title: LocalizedText;
      /** Upload happens via a presigned URL flow (out of scope here). */
      uploadKey: string;
      mimeType: string;
      sizeBytes: number;
      tags?: string[];
      collectionIds?: string[];
    };

export interface UpdateVaultItemRequest {
  title?: LocalizedText;
  tags?: string[];
  collectionIds?: string[];
  note?: LocalizedText | null;
  starred?: boolean;
  /** For notes only — update body. Ignored for other kinds. */
  body?: LocalizedText;
}

// ============================================================================
// Collections (folders)
// ============================================================================

export interface VaultCollection extends AuditFields {
  id: string;
  ownerId: UserId;
  name: LocalizedText;
  /** Optional bilingual description. */
  description: LocalizedText | null;
  /** Item count (denormalized). */
  itemCount: number;
  /** UI accent color. */
  color: string | null;
  /** Sidebar ordering. */
  position: number;
}

export interface CreateCollectionRequest {
  name: LocalizedText;
  description?: LocalizedText;
  color?: string;
}

export interface UpdateCollectionRequest {
  name?: LocalizedText;
  description?: LocalizedText | null;
  color?: string | null;
  position?: number;
}

// ============================================================================
// Tags directory
// ============================================================================

export interface TagSummary {
  tag: string;
  /** Number of items currently using this tag. */
  count: number;
  /** Most-recent use timestamp. */
  lastUsedAt: string;
}

export interface ListTagsResponse {
  tags: TagSummary[];
}

// ============================================================================
// Export
// ============================================================================

export type VaultExportFormat = "zip_markdown" | "zip_json" | "csv";

export interface VaultExportRequest {
  format: VaultExportFormat;
  /** Restrict export to these collections; omit = all. */
  collectionIds?: string[];
  /** Restrict by tag. */
  tags?: string[];
}

export interface VaultExportResponse {
  jobId: string;
  /** Polling endpoint for status. */
  statusUrl: string;
}

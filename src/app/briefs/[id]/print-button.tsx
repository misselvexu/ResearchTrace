"use client";

import { useTranslations } from "next-intl";

export function PrintButton() {
  const t = useTranslations();
  return (
    <button className="btn btn-ghost" onClick={() => window.print()}>
      {t("brief.btn.print")}
    </button>
  );
}

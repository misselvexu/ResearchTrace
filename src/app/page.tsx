import { redirect } from "next/navigation";

/**
 * Root route — redirects to the workspace's Today digest.
 *
 * The legacy landing page (legacy/prototype-v0.3/index.html) will be
 * migrated to its own dedicated route in B4. The B1 sanity-check page
 * has been retired now that the production Today page (B3) is live.
 */
export default function HomePage() {
  redirect("/today");
}

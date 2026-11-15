import { CACHE_TTL_MS, REFRESH_TIMEOUT_MS } from "./config";
import {
  buildLookup,
  defaultBang,
  fetchSiteBangs,
  loadDefaultTrigger,
  loadSiteCache,
  loadUserBangs,
  resolve,
  type SiteCache,
} from "./bangs";

async function siteBangsForRedirect(): Promise<SiteCache | null> {
  const cached = loadSiteCache();
  if (!cached) {
    return fetchSiteBangs(5000).catch(() => null);
  }
  if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached;
  return fetchSiteBangs(REFRESH_TIMEOUT_MS).catch(() => cached);
}

async function redirect(query: string) {
  const site = await siteBangsForRedirect();
  const lookup = buildLookup(site?.bangs ?? [], loadUserBangs());
  location.replace(resolve(query, lookup, defaultBang(lookup, loadDefaultTrigger())));
}

const query = new URLSearchParams(location.search).get("q")?.trim();

if (query) {
  redirect(query);
} else {
  import("./ui").then((ui) => ui.mount(document.getElementById("app")!));
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

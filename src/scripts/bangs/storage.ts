// localStorage persistence and fetching the site-wide list.
import { BANGS_URL } from "../config";
import { parseBangs } from "./format";
import type { Bang, SiteCache } from "./types";

const KEY_SITE = "bang:site";
const KEY_USER = "bang:user";
const KEY_DEFAULT = "bang:default";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / blocked: the site still works, just uncached */
  }
}

export const loadSiteCache = () => read<SiteCache>(KEY_SITE);
export const loadUserBangs = () => read<Bang[]>(KEY_USER) ?? [];
export const saveUserBangs = (bangs: Bang[]) => write(KEY_USER, bangs);
export const loadDefaultTrigger = () => read<string>(KEY_DEFAULT);
export const saveDefaultTrigger = (trigger: string | null) => write(KEY_DEFAULT, trigger);

export async function fetchSiteBangs(timeoutMs?: number): Promise<SiteCache> {
  const res = await fetch(BANGS_URL, {
    cache: "no-cache",
    signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
  });
  if (!res.ok) throw new Error(`${BANGS_URL}: HTTP ${res.status}`);
  const { bangs, errors } = parseBangs(await res.text());
  if (errors.length) console.warn(`[bang] skipped entries in ${BANGS_URL}:\n` + errors.join("\n"));
  const cache: SiteCache = { fetchedAt: Date.now(), bangs };
  write(KEY_SITE, cache);
  return cache;
}

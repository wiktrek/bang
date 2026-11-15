// Turning a query into a destination URL.
import { DEFAULT_BANG } from "../config";
import { PLACEHOLDER } from "./format";
import type { Bang, Lookup } from "./types";

const FALLBACK: Bang = { triggers: ["ddg"], name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s" };

export function buildLookup(site: Bang[], user: Bang[]): Lookup {
  const map: Lookup = new Map();
  for (const list of [site, user]) for (const b of list) for (const t of b.triggers) map.set(t, b);
  return map;
}

export function defaultBang(lookup: Lookup, userDefault: string | null): Bang {
  return (userDefault && lookup.get(userDefault)) || lookup.get(DEFAULT_BANG) || FALLBACK;
}

export const isShadowed = (b: Bang, lookup: Lookup) => !b.triggers.some((t) => lookup.get(t) === b);

export function addUserBang(list: Bang[], bang: Bang): Bang[] {
  const taken = new Set(bang.triggers);
  const rest = list
    .map((b) => ({ ...b, triggers: b.triggers.filter((t) => !taken.has(t)) }))
    .filter((b) => b.triggers.length);
  return [bang, ...rest];
}

const BANG_TOKEN = /(^|\s)!(\S+)/g;

export function resolve(query: string, lookup: Lookup, fallback: Bang): string {
  let bang: Bang | undefined;
  let terms = query;

  for (const m of query.matchAll(BANG_TOKEN)) {
    const found = lookup.get(m[2].toLowerCase());
    if (found) {
      bang = found;
      const start = m.index! + m[1].length;
      terms = query.slice(0, start) + query.slice(m.index! + m[0].length);
      break;
    }
  }

  terms = terms.trim().replace(/\s+/g, " ");
  const target = bang ?? fallback;

  if (bang && !terms) return new URL(target.url.replace(PLACEHOLDER, "")).origin;

  const encoded = encodeURIComponent(terms).replace(/%2F/g, "/");
  return target.url.replace(PLACEHOLDER, encoded);
}

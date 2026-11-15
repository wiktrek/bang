export interface Bang {
  /** Lowercase triggers without the leading "!", e.g. ["g", "google"]. */
  triggers: string[];
  name: string;
  /** URL template; `%s` (or DuckDuckGo-style `{{{s}}}`) is replaced by the query. */
  url: string;
}

export interface SiteCache {
  fetchedAt: number;
  bangs: Bang[];
}

/** trigger -> bang */
export type Lookup = Map<string, Bang>;

// Reactive app state. Components read these signals; actions update them and persist.
import { createMemo, createRoot, createSignal } from "solid-js";
import { DEFAULT_BANG } from "../config";
import {
  addUserBang,
  buildLookup,
  defaultBang,
  fetchSiteBangs,
  loadDefaultTrigger,
  loadSiteCache,
  loadUserBangs,
  saveDefaultTrigger,
  saveUserBangs,
  type Bang,
  type SiteCache,
} from "../bangs";

export type SyncState = "idle" | "syncing" | "error";
export interface Draft {
  trigger: string;
  name: string;
  url: string;
}
export const emptyDraft: Draft = { trigger: "", name: "", url: "" };

function createStore() {
  const [site, setSite] = createSignal<SiteCache | null>(loadSiteCache());
  const [user, setUserSignal] = createSignal<Bang[]>(loadUserBangs());
  const [userDefault, setUserDefault] = createSignal<string | null>(loadDefaultTrigger());
  const [sync, setSync] = createSignal<SyncState>("idle");
  /** Contents of the "add bang" form; "Edit" on a user bang fills it. */
  const [draft, setDraft] = createSignal<Draft>(emptyDraft);
  /** Bumped by "Edit" so the form can focus itself. */
  const [editCount, setEditCount] = createSignal(0);

  const siteBangs = () => site()?.bangs ?? [];
  const lookup = createMemo(() => buildLookup(siteBangs(), user()));
  const currentDefault = createMemo(() => defaultBang(lookup(), userDefault()));

  function setUser(next: Bang[]) {
    setUserSignal(next);
    saveUserBangs(next);
  }

  return {
    site,
    siteBangs,
    user,
    sync,
    draft,
    setDraft,
    editCount,
    lookup,
    currentDefault,

    addBang: (bang: Bang) => setUser(addUserBang(user(), bang)),
    addBangs: (bangs: Bang[]) => setUser(bangs.reduceRight(addUserBang, user())),
    removeBang: (bang: Bang) => setUser(user().filter((b) => b !== bang)),
    edit(b: Bang) {
      setDraft({ trigger: b.triggers.join("|"), name: b.name, url: b.url });
      setEditCount((n) => n + 1);
    },

    setDefault(trigger: string) {
      const value = trigger === DEFAULT_BANG ? null : trigger;
      setUserDefault(value);
      saveDefaultTrigger(value);
    },

    async refresh() {
      setSync("syncing");
      try {
        setSite(await fetchSiteBangs(8000));
        setSync("idle");
      } catch (e) {
        console.error(e);
        setSync("error");
      }
    },
  };
}

export const store = createRoot(createStore);

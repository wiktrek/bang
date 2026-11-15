import { createSignal, Match, Show, Switch } from "solid-js";
import { store } from "../store";
import { Section, timeAgo } from "./common";

export function SearchEngine() {
  const searchUrl = `${location.origin}/?q=%s`;
  const [copyLabel, setCopyLabel] = createSignal("Copy");
  let urlInput!: HTMLInputElement;

  async function copy() {
    try {
      await navigator.clipboard.writeText(searchUrl);
      setCopyLabel("Copied");
    } catch {
      urlInput.select();
      setCopyLabel("Press Ctrl+C");
    }
    setTimeout(() => setCopyLabel("Copy"), 1500);
  }

  function tryIt(e: SubmitEvent) {
    e.preventDefault();
    const q = new FormData(e.currentTarget as HTMLFormElement).get("q")?.toString().trim();
    if (q) location.href = `/?q=${encodeURIComponent(q)}`;
  }

  return (
    <Section>
      <label class="mb-2 block font-semibold" for="url">
        Add this as a custom search engine
      </label>
      <div class="mb-2.5 flex gap-2">
        <input id="url" ref={urlInput} readonly value={searchUrl} class="field font-mono" />
        <button type="button" class="btn" onClick={copy}>
          {copyLabel()}
        </button>
      </div>
      <form class="mb-2.5 flex gap-2" onSubmit={tryIt}>
        <input name="q" placeholder="Try it: !gh unduck" autocomplete="off" class="field" />
        <button type="submit" class="btn">
          Go
        </button>
      </form>
      <p class="text-[13px] text-muted">
        {store.siteBangs().length} site bangs &middot; {store.user().length} yours &middot;{" "}
        <Switch>
          <Match when={store.sync() === "syncing"}>syncing&hellip;</Match>
          <Match when={store.sync() === "error"}>
            <span class="text-err">sync failed</span>
          </Match>
          <Match when={store.site()}>{(site) => `synced ${timeAgo(site().fetchedAt)}`}</Match>
        </Switch>
        <Show when={store.sync() !== "syncing"}>
          {" "}
          &middot;{" "}
          <button type="button" class="btn-link" onClick={store.refresh}>
            Refresh
          </button>
        </Show>
      </p>
    </Section>
  );
}

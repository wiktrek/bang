import { createEffect, createSignal, For, on } from "solid-js";
import { BANGS_URL } from "../../config";
import { hasPlaceholder, hostOf, parseBangs, parseTriggers, toJson, validateUrl } from "../../bangs";
import { emptyDraft, store, type Draft } from "../store";
import { Section, StatusMessage, Triggers, type Message } from "./common";

const IMPORT_EXAMPLE = JSON.stringify([
  { triggers: ["yt", "youtube"], name: "YouTube", url: "https://www.youtube.com/results?search_query=%s" },
]);

function AddForm() {
  const [message, setMessage] = createSignal<Message | null>(null);
  const set = (key: keyof Draft) => (e: InputEvent) =>
    store.setDraft({ ...store.draft(), [key]: (e.currentTarget as HTMLInputElement).value });
  let urlInput!: HTMLInputElement;

  createEffect(on(store.editCount, () => urlInput.focus(), { defer: true }));

  function submit(e: SubmitEvent) {
    e.preventDefault();
    const { trigger, name, url: rawUrl } = store.draft();
    const triggers = parseTriggers(trigger);
    const url = rawUrl.trim();
    const err = !triggers.length ? "Enter a trigger" : validateUrl(url);
    if (err) return setMessage({ text: err, ok: false });

    store.addBang({ triggers, name: name.trim() || hostOf(url) || triggers[0], url });
    const note = hasPlaceholder(url) ? "" : " (no %s, so it always opens that exact URL)";
    setMessage({ text: `Saved !${triggers[0]}${note}`, ok: true });
    store.setDraft(emptyDraft);
  }

  return (
    <>
      <form class="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]" onSubmit={submit}>
        <input
          placeholder="trigger (e.g. mdn|m)"
          required
          autocomplete="off"
          class="field"
          value={store.draft().trigger}
          onInput={set("trigger")}
        />
        <input placeholder="name" autocomplete="off" class="field" value={store.draft().name} onInput={set("name")} />
        <input
          ref={urlInput}
          placeholder="https://developer.mozilla.org/search?q=%s"
          required
          autocomplete="off"
          class="field col-span-full sm:col-span-1"
          value={store.draft().url}
          onInput={set("url")}
        />
        <button type="submit" class="btn col-span-full sm:col-span-1">
          Add
        </button>
      </form>
      <StatusMessage message={message()} />
    </>
  );
}

function UserList() {
  return (
    <ul class="mt-2 mb-4">
      <For each={store.user()} fallback={<li class="py-2.5 text-[13px] text-muted">No personal bangs yet.</li>}>
        {(b) => (
          <li class="flex flex-wrap items-baseline gap-3 border-b border-dashed border-line py-2.5">
            <span>
              <Triggers bang={b} />
            </span>
            <span class="font-medium">{b.name}</span>
            <span class="flex-1 text-[13px] text-muted">{hostOf(b.url)}</span>
            <span class="flex gap-3">
              <button type="button" class="btn-link" onClick={() => store.edit(b)}>
                Edit
              </button>
              <button type="button" class="btn-link hover:text-err" onClick={() => store.removeBang(b)}>
                Remove
              </button>
            </span>
          </li>
        )}
      </For>
    </ul>
  );
}

function ImportExport() {
  const [text, setText] = createSignal("");
  const [message, setMessage] = createSignal<Message | null>(null);

  function importBangs() {
    const { bangs, errors } = parseBangs(text());
    if (bangs.length) store.addBangs(bangs);
    const summary = `Imported ${bangs.length} bang${bangs.length === 1 ? "" : "s"}.`;
    setMessage({ text: [summary, ...errors].join(" "), ok: !errors.length });
    if (!errors.length) setText("");
  }

  function exportBangs() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([toJson(store.user())], { type: "application/json" }));
    a.download = "my-bangs.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <details>
      <summary class="cursor-pointer text-sm text-muted">Import / export</summary>
      <p class="mt-1 text-[13px] text-muted">
        Paste a JSON array in the same format as <a href={BANGS_URL}>{BANGS_URL.slice(1)}</a>.
      </p>
      <textarea
        rows="5"
        placeholder={IMPORT_EXAMPLE}
        class="field mt-1 resize-y font-mono text-[13px]"
        value={text()}
        onInput={(e) => setText(e.currentTarget.value)}
      />
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" class="btn" onClick={importBangs}>
          Import
        </button>
        <button type="button" class="btn btn-ghost" onClick={exportBangs}>
          Download my bangs
        </button>
      </div>
      <StatusMessage message={message()} />
    </details>
  );
}

export function UserBangs() {
  return (
    <Section title="Your bangs">
      <p class="text-[13px] text-muted">
        Stored only in this browser&rsquo;s cache. A trigger you add here overrides the site&rsquo;s bang with the same
        name. Use <code>%s</code> where the search terms go.
      </p>
      <AddForm />
      <UserList />
      <ImportExport />
    </Section>
  );
}

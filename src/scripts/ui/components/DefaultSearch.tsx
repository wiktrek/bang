import { createMemo, For } from "solid-js";
import { hasPlaceholder, isShadowed } from "../../bangs";
import { store } from "../store";
import { Section } from "./common";

/** One option per active bang that takes search terms, keyed by its first active trigger. */
export function DefaultSearch() {
  const options = createMemo(() => {
    const lookup = store.lookup();
    return [...new Set([...store.user(), ...store.siteBangs()])]
      .filter((b) => !isShadowed(b, lookup) && hasPlaceholder(b.url))
      .map((b) => ({ bang: b, trigger: b.triggers.find((t) => lookup.get(t) === b)! }));
  });

  return (
    <Section title="Default search">
      <p class="mb-3 text-[13px] text-muted">Used when a query has no bang. Saved in this browser.</p>
      <select class="field" onChange={(e) => store.setDefault(e.currentTarget.value)}>
        <For each={options()} fallback={<option>{store.currentDefault().name}</option>}>
          {(o) => (
            <option value={o.trigger} selected={o.bang === store.currentDefault()}>
              {o.bang.name} (!{o.trigger})
            </option>
          )}
        </For>
      </select>
    </Section>
  );
}

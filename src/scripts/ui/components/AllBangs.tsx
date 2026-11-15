import { createMemo, createSignal, For, Show } from "solid-js";
import { hostOf, isShadowed, type Bang } from "../../bangs";
import { store } from "../store";
import { Section, Tag, Triggers } from "./common";

const cell = "border-b border-line py-2 pr-2 align-top";
const head = "border-b border-line py-1.5 pr-2 text-left text-xs font-medium text-muted";

const matches = (b: Bang, q: string) =>
  !q || b.triggers.some((t) => t.includes(q)) || b.name.toLowerCase().includes(q) || hostOf(b.url).includes(q);

export function AllBangs() {
  const [filter, setFilter] = createSignal("");

  const rows = createMemo(() => {
    const q = filter().trim().toLowerCase().replace(/^!/, "");
    const lookup = store.lookup();
    return [
      ...store.user().map((bang) => ({ bang, yours: true })),
      ...store.siteBangs().map((bang) => ({ bang, yours: false })),
    ]
      .filter((r) => matches(r.bang, q))
      .map((r) => ({ ...r, shadowed: isShadowed(r.bang, lookup) }));
  });

  const empty = () => (!store.site() && store.sync() === "syncing" ? "Loading bangs…" : "Nothing matches.");

  return (
    <Section>
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2>All bangs</h2>
        <input
          type="search"
          placeholder="Filter"
          autocomplete="off"
          class="field w-[200px]"
          onInput={(e) => setFilter(e.currentTarget.value)}
        />
      </div>
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class={head}>Trigger</th>
            <th class={head}>Name</th>
            <th class={`${head} max-[520px]:hidden`}>Site</th>
          </tr>
        </thead>
        <tbody>
          <For
            each={rows()}
            fallback={
              <tr>
                <td colspan="3" class={`${cell} text-muted`}>
                  {empty()}
                </td>
              </tr>
            }
          >
            {(r) => (
              <tr classList={{ "opacity-45": r.shadowed }}>
                <td class={`${cell} w-[30%]`}>
                  <Triggers bang={r.bang} />
                </td>
                <td class={cell}>
                  {r.bang.name}
                  <Show when={r.yours}>
                    {" "}
                    <Tag>yours</Tag>
                  </Show>
                  <Show when={r.shadowed}>
                    {" "}
                    <Tag>overridden</Tag>
                  </Show>
                </td>
                <td class={`${cell} text-muted max-[520px]:hidden`}>{hostOf(r.bang.url)}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </Section>
  );
}

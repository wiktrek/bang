import { For, Show, type JSX } from "solid-js";
import type { Bang } from "../../bangs";

export const Triggers = (props: { bang: Bang }) => (
  <For each={props.bang.triggers}>{(t) => <code class="chip mr-1">!{t}</code>}</For>
);

export const Tag = (props: { children: JSX.Element }) => <span class="tag">{props.children}</span>;

export const Section = (props: { title?: string; children: JSX.Element }) => (
  <section class="border-t border-line py-7">
    <Show when={props.title}>
      <h2>{props.title}</h2>
    </Show>
    {props.children}
  </section>
);

export interface Message {
  text: string;
  ok: boolean;
}

export const StatusMessage = (props: { message: Message | null }) => (
  <p
    role="status"
    class="mt-2 min-h-[1.2em] text-[13px]"
    classList={{ "text-ok": props.message?.ok, "text-err": props.message?.ok === false }}
  >
    {props.message?.text}
  </p>
);

export function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 36) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

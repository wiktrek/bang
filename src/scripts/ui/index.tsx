import { onMount } from "solid-js";
import { render } from "solid-js/web";
import { AllBangs } from "./components/AllBangs";
import { DefaultSearch } from "./components/DefaultSearch";
import { SearchEngine } from "./components/SearchEngine";
import { UserBangs } from "./components/UserBangs";
import { store } from "./store";

function App() {
  onMount(store.refresh);

  return (
    <main class="mx-auto max-w-190 px-4 pt-16 pb-24">
      <header class="mb-10">
        <h1 class="mb-3 font-mono text-[44px] leading-none font-bold tracking-[-0.04em]">
          <span class="text-accent">!</span>bang
        </h1>
        <p class="max-w-[52ch] text-muted">
          Unduck clone that you can add custom bangs to.
        </p>
      </header>
      <SearchEngine />
      <DefaultSearch />
      <UserBangs />
      <AllBangs />
    </main>
  );
}

export const mount = (root: HTMLElement) => render(() => <App />, root);

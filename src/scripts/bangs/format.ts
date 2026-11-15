// Reading and writing the bangs JSON format, plus URL-template helpers.
import type { Bang } from "./types";

export const PLACEHOLDER = /\{\{\{s\}\}\}|%s/g;

export const hasPlaceholder = (url: string) => /%s|\{\{\{s\}\}\}/.test(url);

export function parseTriggers(raw: string): string[] {
  const list = raw
    .split(/[|\s]+/)
    .map((t) => t.replace(/^!+/, "").toLowerCase())
    .filter(Boolean);
  return [...new Set(list)];
}

export function validateUrl(url: string): string | null {
  try {
    const u = new URL(url.replace(PLACEHOLDER, "test"));
    if (u.protocol !== "https:" && u.protocol !== "http:") return "URL must start with http:// or https://";
    return null;
  } catch {
    return "Not a valid URL";
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url.replace(PLACEHOLDER, "")).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function toBang(item: unknown): Bang | string {
  if (!item || typeof item !== "object") return "expected an object";
  const { triggers: raw, name, url } = item as Record<string, unknown>;
  const triggers = parseTriggers(Array.isArray(raw) ? raw.filter((t) => typeof t === "string").join("|") : typeof raw === "string" ? raw : "");
  if (!triggers.length) return "missing triggers";
  if (typeof url !== "string") return "missing url";
  const urlError = validateUrl(url.trim());
  if (urlError) return urlError;
  return { triggers, name: (typeof name === "string" && name.trim()) || triggers[0], url: url.trim() };
}

export function parseBangs(text: string): { bangs: Bang[]; errors: string[] } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { bangs: [], errors: [`Invalid JSON: ${(e as Error).message}`] };
  }
  if (!Array.isArray(data)) data = [data];

  const bangs: Bang[] = [];
  const errors: string[] = [];
  (data as unknown[]).forEach((item, i) => {
    const result = toBang(item);
    if (typeof result === "string") errors.push(`entry ${i + 1}: ${result}`);
    else bangs.push(result);
  });
  return { bangs, errors };
}

export const toJson = (bangs: Bang[]) =>
  JSON.stringify(bangs.map(({ triggers, name, url }) => ({ triggers, name, url })), null, 2) + "\n";

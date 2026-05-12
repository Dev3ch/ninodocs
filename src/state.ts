import { signal } from '@preact/signals';
import type { NinodocsConfig, Page } from './types';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function pageSlug(group: string, page: Page): string {
  return `${slugify(group)}/${slugify(page.title)}`;
}

export interface FlatEntry {
  group: string;
  page: Page;
  slug: string;
}

export function flattenPages(config: NinodocsConfig): FlatEntry[] {
  const out: FlatEntry[] = [];
  for (const g of config.sidebar) {
    for (const p of g.pages) {
      out.push({ group: g.group, page: p, slug: pageSlug(g.group, p) });
    }
  }
  return out;
}

export const currentSlug = signal<string>(readHash());
export const searchQuery = signal<string>('');
export const sidebarOpen = signal<boolean>(false);

function readHash(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hash.replace(/^#\/?/, '');
}

export function initRouter(defaultSlug: string) {
  if (!currentSlug.value) currentSlug.value = defaultSlug;
  window.addEventListener('hashchange', () => {
    currentSlug.value = readHash() || defaultSlug;
    sidebarOpen.value = false;
  });
}

export function navigate(slug: string) {
  window.location.hash = `/${slug}`;
}

import { signal } from '@preact/signals';
import type { DocsVersion, NinodocsConfig, Page } from './types';

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

const VERSION_STORAGE_KEY = 'ninodocs:version';

function readStoredVersion(): string {
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function parseHash(): { version: string; slug: string } {
  if (typeof window === 'undefined') return { version: '', slug: '' };
  const raw = window.location.hash.replace(/^#\/?/, '');
  const m = raw.match(/^v=([^/]+)\/(.*)$/);
  if (m) return { version: m[1], slug: m[2] };
  return { version: '', slug: raw };
}

export function pickDefaultVersion(versions: DocsVersion[]): DocsVersion | null {
  if (!versions.length) return null;
  const fromHash = parseHash().version;
  if (fromHash) {
    const hit = versions.find((v) => v.id === fromHash);
    if (hit) return hit;
  }
  const stored = readStoredVersion();
  if (stored) {
    const hit = versions.find((v) => v.id === stored);
    if (hit) return hit;
  }
  return versions.find((v) => v.current) || versions[0];
}

export function resolveVersionConfig(root: NinodocsConfig, version: DocsVersion | null): NinodocsConfig {
  if (!version) return root;
  const { versions: _v, ...base } = root;
  return { ...base, ...version.config } as NinodocsConfig;
}

export const currentSlug = signal<string>(parseHash().slug);
export const currentVersionId = signal<string>('');
export const searchQuery = signal<string>('');
export const sidebarOpen = signal<boolean>(false);

function writeHash(versionId: string, slug: string) {
  const prefix = versionId ? `v=${versionId}/` : '';
  const next = `#/${prefix}${slug}`;
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}

export function initRouter(defaultSlug: string, defaultVersionId = '') {
  if (!currentSlug.value) currentSlug.value = defaultSlug;
  if (!currentVersionId.value) currentVersionId.value = defaultVersionId;
  window.addEventListener('hashchange', () => {
    const { version, slug } = parseHash();
    currentVersionId.value = version || defaultVersionId;
    currentSlug.value = slug || defaultSlug;
    sidebarOpen.value = false;
  });
}

export function navigate(slug: string) {
  writeHash(currentVersionId.value, slug);
}

export function setVersion(id: string, defaultSlug: string) {
  currentVersionId.value = id;
  try {
    if (id) localStorage.setItem(VERSION_STORAGE_KEY, id);
    else localStorage.removeItem(VERSION_STORAGE_KEY);
  } catch {
    /* noop */
  }
  writeHash(id, defaultSlug);
}

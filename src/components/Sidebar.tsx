import type { NinodocsConfig } from '../types';
import { isEndpoint } from '../types';
import {
  currentSlug,
  currentVersionId,
  flattenPages,
  navigate,
  pageSlug,
  resolveVersionConfig,
  searchQuery,
  setVersion,
  sidebarOpen,
} from '../state';
import { IconSearch } from './icons';
import { VersionPicker } from './VersionPicker';

interface Props {
  config: NinodocsConfig;
  rootConfig: NinodocsConfig;
}

export function Sidebar({ config, rootConfig }: Props) {
  const q = searchQuery.value.trim().toLowerCase();
  const versions = rootConfig.versions || [];
  const onVersionChange = (id: string) => {
    const v = versions.find((x) => x.id === id) || null;
    const next = resolveVersionConfig(rootConfig, v);
    const firstSlug = flattenPages(next)[0]?.slug || '';
    setVersion(id, firstSlug);
  };

  return (
    <aside class={`nd-left ${sidebarOpen.value ? 'open' : ''}`} aria-label="Documentation navigation">
      <div class="nd-brand" aria-label={config.title}>
        {config.logo ? (
          <img src={config.logo} alt="" />
        ) : (
          <span class="nd-brand-dot" aria-hidden="true" />
        )}
        <span>{config.title}</span>
      </div>

      {versions.length > 0 && (
        <VersionPicker
          versions={versions}
          activeId={currentVersionId.value}
          onChange={onVersionChange}
        />
      )}

      <div class="nd-search">
        <span class="nd-search-icon">
          <IconSearch />
        </span>
        <input
          class="nd-search-input"
          type="search"
          placeholder="Search…"
          aria-label="Search documentation"
          value={searchQuery.value}
          onInput={(e) => (searchQuery.value = (e.target as HTMLInputElement).value)}
        />
        <span class="nd-kbd" aria-hidden="true">⌘K</span>
      </div>

      {config.sidebar.map((group) => {
        const filtered = q
          ? group.pages.filter((p) => p.title.toLowerCase().includes(q))
          : group.pages;
        if (filtered.length === 0) return null;
        return (
          <div class="nd-group" key={group.group}>
            <div class="nd-group-title">{group.group}</div>
            <nav>
              {filtered.map((page) => {
                const slug = pageSlug(group.group, page);
                const active = currentSlug.value === slug;
                return (
                  <a
                    key={slug}
                    class={`nd-nav-link ${active ? 'active' : ''}`}
                    href={`#/${slug}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(slug);
                      sidebarOpen.value = false;
                    }}
                  >
                    {isEndpoint(page) && (
                      <span class={`nd-method ${page.method}`}>{page.method}</span>
                    )}
                    <span class="nd-nav-label">{page.title}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        );
      })}
    </aside>
  );
}

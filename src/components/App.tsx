import { useEffect, useMemo } from 'preact/hooks';
import type { NinodocsConfig } from '../types';
import { currentSlug, flattenPages, sidebarOpen } from '../state';
import { isEndpoint } from '../types';
import { syncEndpoint } from '../requestStore';
import { Sidebar } from './Sidebar';
import { Content } from './Content';
import { RightPanel } from './RightPanel';
import { IconMenu, IconX } from './icons';

interface Props {
  config: NinodocsConfig;
}

export function App({ config }: Props) {
  const flat = useMemo(() => flattenPages(config), [config]);
  const slug = currentSlug.value;
  const match = flat.find((p) => p.slug === slug) || flat[0] || null;
  const themeClass = config.theme?.mode === 'light' ? 'nd-light' : '';

  const endpoint = match?.page && isEndpoint(match.page) ? match.page : null;
  syncEndpoint(config, endpoint);

  const styleVars = config.theme?.primary
    ? ({
        '--nd-primary': config.theme.primary,
        '--nd-primary-foreground':
          config.theme.primaryForeground || 'rgba(255,255,255,0.95)',
      } as Record<string, string>)
    : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') sidebarOpen.value = false;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div class={`ninodocs ${themeClass}`} style={styleVars}>
      <div class="nd-topbar">
        <button
          class="nd-menu-btn"
          onClick={() => (sidebarOpen.value = !sidebarOpen.value)}
          aria-label={sidebarOpen.value ? 'Close navigation' : 'Open navigation'}
        >
          {sidebarOpen.value ? <IconX /> : <IconMenu />}
        </button>
        <span class="nd-brand">
          <span class="nd-brand-dot" aria-hidden="true" />
          {config.title}
        </span>
        <span class="nd-topbar-spacer" />
      </div>

      <div
        class={`nd-backdrop ${sidebarOpen.value ? 'show' : ''}`}
        onClick={() => (sidebarOpen.value = false)}
        aria-hidden="true"
      />

      <div class="nd-layout">
        <Sidebar config={config} />
        <Content config={config} page={match?.page ?? null} slug={match?.slug ?? ''} />
        <RightPanel config={config} page={match?.page ?? null} />
      </div>
    </div>
  );
}

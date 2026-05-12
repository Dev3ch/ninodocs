import { useMemo } from 'preact/hooks';
import type { NinodocsConfig } from '../types';
import { currentSlug, flattenPages } from '../state';
import { Sidebar } from './Sidebar';
import { Content } from './Content';
import { RightPanel } from './RightPanel';

interface Props {
  config: NinodocsConfig;
}

export function App({ config }: Props) {
  const flat = useMemo(() => flattenPages(config), [config]);
  const slug = currentSlug.value;
  const match = flat.find((p) => p.slug === slug) || flat[0] || null;
  const themeClass = config.theme?.mode === 'light' ? 'nd-light' : '';

  const styleVars = config.theme?.primary
    ? ({
        '--nd-primary': config.theme.primary,
        '--nd-primary-foreground':
          config.theme.primaryForeground || 'rgba(0,0,0,0.85)',
      } as Record<string, string>)
    : undefined;

  return (
    <div class={`ninodocs ${themeClass}`} style={styleVars}>
      <div class="nd-layout">
        <Sidebar config={config} />
        <Content config={config} page={match?.page ?? null} />
        <RightPanel config={config} page={match?.page ?? null} />
      </div>
    </div>
  );
}

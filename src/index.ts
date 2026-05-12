import { render, h } from 'preact';
import { App } from './components/App';
import { initRouter, flattenPages } from './state';
import type { NinodocsConfig } from './types';
import './styles.css';

export type {
  NinodocsConfig,
  ThemeConfig,
  AuthConfig,
  SidebarGroup,
  Page,
  EndpointPage,
  HttpMethod,
  ThemeMode,
} from './types';

export interface MountOptions {
  /** Selector or element to mount into. */
  target: string | HTMLElement;
  config: NinodocsConfig;
}

export function mount(opts: MountOptions): { destroy: () => void } {
  const el =
    typeof opts.target === 'string'
      ? document.querySelector<HTMLElement>(opts.target)
      : opts.target;
  if (!el) throw new Error(`ninodocs: target not found (${String(opts.target)})`);

  const first = flattenPages(opts.config)[0];
  if (first) initRouter(first.slug);

  render(h(App, { config: opts.config }), el);

  return {
    destroy() {
      render(null, el);
    },
  };
}

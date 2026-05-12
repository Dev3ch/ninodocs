import { render, h } from 'preact';
import { App } from './components/App';
import { initRouter, flattenPages, pickDefaultVersion, resolveVersionConfig } from './state';
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
  ParamSpec,
  ParamType,
  HeaderSpec,
  BodySpec,
  ResponseSpec,
  DocsVersion,
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

  const versions = opts.config.versions || [];
  const defaultVersion = pickDefaultVersion(versions);
  const initialConfig = resolveVersionConfig(opts.config, defaultVersion);
  const first = flattenPages(initialConfig)[0];
  if (first) initRouter(first.slug, defaultVersion?.id || '');

  document.documentElement.classList.add('nd-scroll-host');
  document.body.classList.add('nd-scroll-host');

  render(h(App, { config: opts.config }), el);

  return {
    destroy() {
      render(null, el);
      document.documentElement.classList.remove('nd-scroll-host');
      document.body.classList.remove('nd-scroll-host');
    },
  };
}

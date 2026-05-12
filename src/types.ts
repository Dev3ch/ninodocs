export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type ThemeMode = 'dark' | 'light' | 'auto';

export interface ThemeConfig {
  /** Brand accent color, used for links and highlights. */
  primary?: string;
  mode?: ThemeMode;
  /** Optional accent foreground (text on primary). */
  primaryForeground?: string;
}

export interface AuthConfig {
  type: 'bearer' | 'apiKey' | 'basic' | 'none';
  /** Header name for apiKey auth (default: Authorization for bearer). */
  headerName?: string;
  /** UI label shown next to the token input. */
  label?: string;
}

export interface PageBase {
  title: string;
  /** Path to markdown file OR raw markdown string (when `content` is set, file is ignored). */
  file?: string;
  content?: string;
}

export interface EndpointPage extends PageBase {
  method: HttpMethod;
  /** Path relative to `baseUrl`, e.g. `/clients/{id}` */
  path: string;
  /** Optional override of the global baseUrl. */
  baseUrl?: string;
}

export type Page = PageBase | EndpointPage;

export interface SidebarGroup {
  group: string;
  pages: Page[];
}

export interface NinodocsConfig {
  title: string;
  logo?: string;
  description?: string;
  baseUrl?: string;
  theme?: ThemeConfig;
  auth?: AuthConfig;
  sidebar: SidebarGroup[];
  /** Footer links (optional). */
  footer?: { label: string; href: string }[];
}

export function isEndpoint(page: Page): page is EndpointPage {
  return typeof (page as EndpointPage).method === 'string';
}

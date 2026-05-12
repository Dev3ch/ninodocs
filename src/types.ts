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

export type ParamType = 'string' | 'integer' | 'number' | 'boolean';

export interface ParamSpec {
  name: string;
  type?: ParamType;
  required?: boolean;
  description?: string;
  /** Default/example value shown in the input. */
  example?: string | number | boolean;
  /** For enums. */
  enum?: (string | number)[];
}

export interface HeaderSpec extends ParamSpec {
  /** When true, hide from the auto-generated samples (e.g. computed elsewhere). */
  hidden?: boolean;
}

export interface BodySpec {
  /** `application/json` is the default. */
  contentType?: string;
  /** Pretty example used to prefill the editor. */
  example?: unknown;
  description?: string;
}

export interface ResponseSpec {
  /** HTTP status code, e.g. 200, 404. */
  status: number;
  /** Short label shown next to the status (e.g. "OK", "Not found"). */
  description?: string;
  /** Example payload — object/array (rendered as JSON) or raw string. */
  example?: unknown;
  /** Defaults to `application/json`. */
  contentType?: string;
}

export interface EndpointPage extends PageBase {
  method: HttpMethod;
  /** Path relative to `baseUrl`, e.g. `/clients/{id}` */
  path: string;
  /** Optional override of the global baseUrl. */
  baseUrl?: string;
  /**
   * Per-endpoint auth override. Set to `{ type: 'none' }` for public endpoints
   * (login, signup, health checks). When omitted, the global `config.auth` applies.
   */
  auth?: AuthConfig;
  /** Path parameters, matched against `{name}` placeholders in `path`. */
  params?: ParamSpec[];
  /** Query string parameters. */
  query?: ParamSpec[];
  /** Custom headers (besides auth + content-type). */
  headers?: HeaderSpec[];
  /** Request body (for POST/PUT/PATCH). */
  body?: BodySpec;
  /** Documented responses (success + errors). */
  responses?: ResponseSpec[];
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
  /**
   * Documentation versions. Each version has its own sidebar/endpoints/baseUrl.
   * When set, a version selector appears in the sidebar. The active version is
   * remembered in localStorage and reflected in the URL hash (`#v=<id>/...`).
   */
  versions?: DocsVersion[];
}

export interface DocsVersion {
  /** Stable identifier used in URLs and localStorage (e.g. `v1`, `2024-08`). */
  id: string;
  /** Display label (e.g. `v1.0`, `Stable`, `2024-08`). */
  label: string;
  /** Optional short tag rendered next to the label (e.g. `current`, `deprecated`). */
  badge?: string;
  /** Marks this version as the default when no other has been selected. */
  current?: boolean;
  /**
   * Per-version overrides. The root config is used as the base, and any field
   * here overrides it (sidebar, baseUrl, auth, title, etc.).
   */
  config: Partial<Omit<NinodocsConfig, 'versions'>>;
}

export function isEndpoint(page: Page): page is EndpointPage {
  return typeof (page as EndpointPage).method === 'string';
}

/**
 * Resolve the effective auth for an endpoint:
 * the endpoint's own `auth` if defined, otherwise the global one.
 * Returns `undefined` only when neither is set.
 */
export function resolveAuth(
  endpoint: EndpointPage | null,
  global: AuthConfig | undefined,
): AuthConfig | undefined {
  if (endpoint && endpoint.auth) return endpoint.auth;
  return global;
}

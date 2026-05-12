import type { EndpointPage, NinodocsConfig } from '../types';
import { IconPlay } from './icons';

interface Props {
  config: NinodocsConfig;
  endpoint: EndpointPage;
  onOpen: () => void;
}

export function EndpointBar({ config, endpoint, onOpen }: Props) {
  const baseUrl = endpoint.baseUrl || config.baseUrl || '';
  return (
    <div class="nd-endpoint-bar-doc">
      <div class="nd-endpoint-bar-url" title={`${baseUrl}${endpoint.path}`}>
        <span class={`nd-method ${endpoint.method}`}>{endpoint.method}</span>
        <span class="nd-endpoint-path-text">{endpoint.path}</span>
      </div>
      <button class="nd-try-btn" onClick={onOpen} aria-label="Open Try it">
        <IconPlay />
        <span>Try it</span>
      </button>
    </div>
  );
}

import type { NinodocsConfig } from '../types';
import { isEndpoint } from '../types';
import { currentSlug, navigate, pageSlug } from '../state';

interface Props {
  config: NinodocsConfig;
}

export function Sidebar({ config }: Props) {
  return (
    <aside class="nd-left">
      <div class="nd-brand">
        {config.logo && <img src={config.logo} alt="" />}
        <span>{config.title}</span>
      </div>

      {config.sidebar.map((group) => (
        <div key={group.group}>
          <div class="nd-group-title">{group.group}</div>
          {group.pages.map((page) => {
            const slug = pageSlug(group.group, page);
            const active = currentSlug.value === slug;
            return (
              <a
                key={slug}
                class={`nd-nav-link ${active ? 'active' : ''}`}
                href={`#/${slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(slug);
                }}
              >
                {isEndpoint(page) && (
                  <span class={`nd-method ${page.method}`}>{page.method}</span>
                )}
                <span>{page.title}</span>
              </a>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

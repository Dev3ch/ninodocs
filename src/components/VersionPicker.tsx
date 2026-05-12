import { useEffect, useRef, useState } from 'preact/hooks';
import type { DocsVersion } from '../types';
import { IconCheck, IconChevronDown } from './icons';

interface Props {
  versions: DocsVersion[];
  activeId: string;
  onChange: (id: string) => void;
}

function badgeTone(badge: string | undefined): string {
  if (!badge) return '';
  const v = badge.toLowerCase();
  if (v.includes('current') || v.includes('stable') || v.includes('latest')) return 'ok';
  if (v.includes('beta') || v.includes('preview') || v.includes('alpha') || v.includes('next')) return 'beta';
  if (v.includes('legacy') || v.includes('deprecated') || v.includes('eol')) return 'legacy';
  return 'neutral';
}

export function VersionPicker({ versions, activeId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  const active = versions.find((v) => v.id === activeId) || versions[0];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIndex((i) => (i + 1) % versions.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIndex((i) => (i - 1 + versions.length) % versions.length);
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const v = versions[focusIndex];
        if (v) {
          onChange(v.id);
          setOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, versions, focusIndex, onChange]);

  const toggle = () => {
    if (!open) {
      const idx = versions.findIndex((v) => v.id === activeId);
      setFocusIndex(Math.max(0, idx));
    }
    setOpen((o) => !o);
  };

  return (
    <div class="nd-vp" ref={rootRef}>
      <div class="nd-vp-label">Version</div>
      <button
        ref={triggerRef}
        type="button"
        class={`nd-vp-trigger ${open ? 'open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
      >
        <span class="nd-vp-trigger-main">
          <span class="nd-vp-trigger-label">{active?.label || '—'}</span>
          {active?.badge && (
            <span class={`nd-vp-badge ${badgeTone(active.badge)}`}>{active.badge}</span>
          )}
        </span>
        <span class={`nd-vp-chev ${open ? 'open' : ''}`}>
          <IconChevronDown />
        </span>
      </button>

      {open && (
        <div class="nd-vp-menu" role="listbox" aria-label="Documentation versions">
          {versions.map((v, i) => {
            const selected = v.id === activeId;
            return (
              <button
                key={v.id}
                type="button"
                role="option"
                aria-selected={selected}
                class={`nd-vp-item ${selected ? 'selected' : ''} ${focusIndex === i ? 'focus' : ''}`}
                onMouseEnter={() => setFocusIndex(i)}
                onClick={() => {
                  onChange(v.id);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <span class="nd-vp-item-main">
                  <span class="nd-vp-item-label">{v.label}</span>
                  {v.badge && (
                    <span class={`nd-vp-badge ${badgeTone(v.badge)}`}>{v.badge}</span>
                  )}
                </span>
                {selected && (
                  <span class="nd-vp-item-check" aria-hidden="true">
                    <IconCheck />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

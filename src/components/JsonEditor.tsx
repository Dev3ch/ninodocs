import { useEffect, useRef, useState } from 'preact/hooks';
import { highlight } from '../highlight';

interface Props {
  value: string;
  onInput: (v: string) => void;
  mode?: 'dark' | 'light';
  minRows?: number;
}

export function JsonEditor({ value, onInput, mode = 'dark', minRows = 8 }: Props) {
  const [html, setHtml] = useState<string>('');
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    highlight(value || ' ', 'json', mode).then((h) => {
      if (cancelled) return;
      setHtml(h);
    });
    return () => {
      cancelled = true;
    };
  }, [value, mode]);

  const syncScroll = () => {
    if (taRef.current && preRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.slice(0, start) + '  ' + value.slice(end);
      onInput(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  const rows = Math.min(20, Math.max(minRows, (value.match(/\n/g)?.length ?? 0) + 1));

  return (
    <div class="nd-json-editor">
      <div
        ref={preRef}
        class="nd-json-editor-pre"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <textarea
        ref={taRef}
        class="nd-json-editor-ta"
        spellcheck={false}
        rows={rows}
        value={value}
        onInput={(e) => onInput((e.target as HTMLTextAreaElement).value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

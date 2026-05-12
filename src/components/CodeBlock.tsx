import { useEffect, useState } from 'preact/hooks';
import { highlight } from '../highlight';

interface Props {
  code: string;
  lang: string;
  mode?: 'dark' | 'light';
}

export function CodeBlock({ code, lang, mode = 'dark' }: Props) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    highlight(code, lang, mode).then((h) => {
      if (!cancelled) setHtml(h);
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang, mode]);

  if (!html) {
    return (
      <pre>
        <code>{code}</code>
      </pre>
    );
  }
  return <div class="nd-code-body" dangerouslySetInnerHTML={{ __html: html }} />;
}

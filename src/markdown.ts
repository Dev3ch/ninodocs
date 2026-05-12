import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
});

export function renderMarkdown(source: string): string {
  return md.render(source);
}

const cache = new Map<string, Promise<string>>();

export function loadMarkdown(file: string): Promise<string> {
  if (!cache.has(file)) {
    cache.set(
      file,
      fetch(file).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${file}: ${r.status}`);
        return r.text();
      }),
    );
  }
  return cache.get(file)!;
}

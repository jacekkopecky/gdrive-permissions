/**
 * copied from https://registry.npmjs.org/archy/-/archy-1.0.0.tgz
 * then typescriptified with help of @types/archy
 * because there is no source code repo for substack/archy anymore
 * then adapted for my needs by renaming label to name, and nodes to children
 */

interface Data {
  name: string;
  children?: (Data | string)[];
}

interface Options {
  unicode?: boolean;
}

const chars = {
  '│': '|',
  '└': '`',
  '├': '+',
  '─': '-',
  '┬': '-',
} as const;

type Chars = keyof typeof chars;

export default function archy(obj: Data | string, prefix = '', opts: Options = {}): string {
  function chr(s: Chars) {
    return opts.unicode === false ? chars[s] : s;
  }

  if (typeof obj === 'string') obj = { name: obj };

  const children = obj.children || [];
  const lines = (obj.name || '').split('\n');
  const splitter = '\n' + prefix + (children.length ? chr('│') : ' ') + ' ';

  return (
    prefix +
    lines.join(splitter) +
    '\n' +
    children
      .map((node, ix) => {
        const last = ix === children.length - 1;
        const more = typeof node === 'object' && node.children?.length;
        const prefix_ = prefix + (last ? ' ' : chr('│')) + ' ';

        return (
          prefix +
          (last ? chr('└') : chr('├')) +
          chr('─') +
          (more ? chr('┬') : chr('─')) +
          ' ' +
          archy(node, prefix_, opts).slice(prefix.length + 2)
        );
      })
      .join('')
  );
}

/**
 * Return how many characters are before the item name if the item is at `depth` in the hierarchy.
 * Depth 0 is a top-level item, its children are at depth 1 and so on.
 */
export function getDepthIndent(depth: number): number {
  return depth <= 0 ? 0 : depth * 2 + 2;
}

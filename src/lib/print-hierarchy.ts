import archy, { getDepthIndent } from './archy.js';
import { stringWidth } from './colrm-width.js';
import { CoreFile } from './types.js';

interface PrintHierarchyOptions {
  printNameAnnotations?: boolean;
}

export function printHierarchy<T extends CoreFile<T>>(
  roots: T[],
  opts: PrintHierarchyOptions = {}
): void {
  let hierarchy = roots;

  if (opts.printNameAnnotations) {
    const maxLen = getMaximumLineLength(roots);
    hierarchy = annotateNames(roots, maxLen + 1) ?? hierarchy;
  }

  for (const root of hierarchy) {
    console.log(archy(root));
  }

  function getMaximumLineLength(items: T[] | undefined, currentDepth = 0): number {
    if (!items) return 0;
    let max = 0;
    for (const item of items) {
      max = Math.max(max, stringWidth(item.name) + getDepthIndent(currentDepth));
      max = Math.max(max, getMaximumLineLength(item.children, currentDepth + 1));
    }
    return max;
  }

  function annotateNames(items: T[] | undefined, len: number, currentDepth = 0): T[] | undefined {
    if (!items) return items;

    return items.map((item) => {
      const name = item.nameAnnotation
        ? item.name +
          ' '.repeat(len - getDepthIndent(currentDepth) - stringWidth(item.name)) +
          ' ' +
          item.nameAnnotation
        : item.name;

      const children = annotateNames(item.children, len, currentDepth + 1);

      return {
        ...item,
        name,
        children,
      };
    });
  }
}

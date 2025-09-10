import { ActionDef } from '../__defs__';

export const flattenActionGroup = <T>(o: object): Record<string, T> =>
  flattenObject<T>(o, (value: unknown) => value instanceof ActionDef);

export const flattenActionHandlers = <T>(o: object): Record<string, T> =>
  flattenObject<T>(o, (value: unknown) => typeof value === 'function');

export function flattenObject<T>(
  o: object,
  comparisonFn: (value: any) => boolean,
  prefix?: string
): Record<string, T> {
  const result: Record<string, T> = {};
  const stack: Array<{ obj: object; prefix: string }> = [
    { obj: o, prefix: prefix || '' },
  ];
  const visited = new Set<object>();

  while (stack.length > 0) {
    const { obj, prefix: currentPrefix } = stack.pop()!;

    if (visited.has(obj)) {
      continue;
    }
    visited.add(obj);

    for (const [key, value] of Object.entries(obj)) {
      const path = currentPrefix ? `${currentPrefix}.${key}` : key;

      if (comparisonFn(value)) {
        result[path] = value as T;
      } else if (value && typeof value === 'object') {
        stack.push({ obj: value, prefix: path });
      }
    }
  }

  return result;
}

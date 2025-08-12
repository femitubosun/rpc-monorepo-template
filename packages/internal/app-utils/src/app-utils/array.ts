export function uniqueBy<T, K extends keyof T>(
  arr: T[],
  key: K
): T[] {
  return Array.from(
    new Map(arr.map((item) => [item[key], item])).values()
  );
}

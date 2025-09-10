/**
 * Makes an array of unique items from an input array of objects
 * @param arr Array to compact
 * @param key object key to ensure is unique
 * @returns New array with falsy values removed
 */
export function uniqueBy<T, K extends keyof T>(arr: T[], key: K): T[] {
  return Array.from(new Map(arr.map((item) => [item[key], item])).values());
}

/**
 * Removes falsy values from an array
 * @param arr Array to compact
 * @returns New array with falsy values removed
 */
export function compact<T>(
  arr: (T | undefined | null | false | 0 | '')[]
): T[] {
  return arr.filter(Boolean) as T[];
}

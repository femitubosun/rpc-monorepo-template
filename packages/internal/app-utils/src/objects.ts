/**
 * Removes undefined values from an object
 * @param obj Object to clean
 * @returns New object with undefined properties removed
 */
export function clean<T extends Record<string, any>>(
  obj: T
): { [K in keyof T]: T[K] extends undefined ? never : T[K] } {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as any;
}

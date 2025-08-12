/**
 * Wait
 * @param seconds seconds to wait for
 * @returns
 */
export function wait(seconds: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, seconds * 1000)
  );
}

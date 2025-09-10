export function setupTestUtils() {
  // Add any global testing setup here
  console.log('Test utilities initialized');
}

export function createTestId(component: string, element?: string): string {
  return element ? `${component}-${element}` : component;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

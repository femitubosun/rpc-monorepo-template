import { vi } from 'vitest';

export const createMockBuilder = () => {
  const mocks = new Map();

  return {
    mockModule(moduleName: string, mockFactory: () => any) {
      const mockValue = mockFactory();
      mocks.set(moduleName, mockValue);

      vi.mock(moduleName, async (importOriginal) => {
        if (moduleName.startsWith('@template/')) {
          const actual: any = await importOriginal();
          return { ...actual, ...mockValue };
        }
        return mockValue;
      });

      return mockValue;
    },

    getMock(moduleName: string) {
      return mocks.get(moduleName);
    },

    clearAll() {
      vi.clearAllMocks();
    },
  };
};

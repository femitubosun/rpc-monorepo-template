export const AppErrorTypeDef = {
  NOT_FOUND: { name: 'NOT_FOUND', code: 404 },
  UNAUTHORIZED: { name: 'UNAUTHORIZED', code: 401 },
  FORBIDDEN: { name: 'FORBIDDEN', code: 403 },
  BAD_REQUEST: { name: 'BAD_REQUEST', code: 400 },
  CONFLICT: { name: 'CONFLICT', code: 409 },
  INTERNAL: { name: 'INTERNAL', code: 500 },
  TOO_MANY_REQUESTS: {
    name: 'TOO_MANY_REQUESTS',
    code: 429,
  },
} as const;

export type AppErrorType = keyof typeof AppErrorTypeDef;

export type AppErrorOptions = {
  message: string;
  data?: any;
  action?: string; // TODO
  code?: number;
  type: AppErrorType;
};

export type ActionErrorOptions = {
  message: string;
  data?: any;
  action: string;
  type: AppErrorType;
};

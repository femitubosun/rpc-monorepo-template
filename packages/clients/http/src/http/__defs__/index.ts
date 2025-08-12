import type { AxiosRequestConfig } from 'axios';

export interface RequestPayloadOptions<T = unknown> {
  endpointUrl: string;
  dataPayload?: T;
  requestConfig?: AxiosRequestConfig;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  apiResponse: T;
}

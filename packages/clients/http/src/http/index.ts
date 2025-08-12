import axios, { type AxiosInstance } from 'axios';
import type {
  ApiResponse,
  RequestPayloadOptions,
} from './__defs__';

class HttpService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({});
  }

  public async get<ResponseType = unknown>(
    getRequestPayloadOptions: RequestPayloadOptions
  ): Promise<ApiResponse<ResponseType>> {
    const { endpointUrl, requestConfig } =
      getRequestPayloadOptions;
    const response = await this.client.get<ResponseType>(
      endpointUrl,
      requestConfig
    );
    return {
      statusCode: response.status,
      apiResponse: response.data,
    };
  }

  public async post<
    RequestType = unknown,
    ResponseType = unknown,
  >(
    postRequestPayloadOptions: RequestPayloadOptions<RequestType>
  ): Promise<ApiResponse<ResponseType>> {
    const { endpointUrl, dataPayload, requestConfig } =
      postRequestPayloadOptions;
    const response = await this.client.post<ResponseType>(
      endpointUrl,
      dataPayload,
      requestConfig
    );

    return {
      statusCode: response.status,
      apiResponse: response.data,
    };
  }

  public async put<
    RequestType = unknown,
    ResponseType = unknown,
  >(
    putRequestPayloadOptions: RequestPayloadOptions<RequestType>
  ): Promise<ApiResponse<ResponseType>> {
    const { endpointUrl, dataPayload, requestConfig } =
      putRequestPayloadOptions;
    const response = await this.client.put<ResponseType>(
      endpointUrl,
      dataPayload,
      requestConfig
    );
    return {
      statusCode: response.status,
      apiResponse: response.data,
    };
  }

  public async patch<
    RequestType = unknown,
    ResponseType = unknown,
  >(
    patchRequestPayloadOptions: RequestPayloadOptions<RequestType>
  ): Promise<ApiResponse<ResponseType>> {
    const { endpointUrl, dataPayload, requestConfig } =
      patchRequestPayloadOptions;
    const response = await this.client.patch<ResponseType>(
      endpointUrl,
      dataPayload,
      requestConfig
    );
    return {
      statusCode: response.status,
      apiResponse: response.data,
    };
  }
}

export default new HttpService();

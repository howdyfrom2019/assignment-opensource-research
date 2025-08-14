/**
 * A simple implementation of a custom Axios-like library based on the provided architecture.
 * This code demonstrates how to build a request pipeline with interceptors using Promises.
 */

// --- 1. Type Definitions ---
// Define interfaces for a consistent type system.

/**
 * Interface for the request configuration object.
 */
export interface AxiosRequestConfig {
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  [key: string]: any;
}

/**
 * Interface for the response object.
 */
export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
  request: XMLHttpRequest;
}

/**
 * class for the error object.
 */
export class AxiosError extends Error {
  isAxiosError: boolean;
  config: AxiosRequestConfig;
  code?: string;
  request?: any;
  response?: AxiosResponse;

  constructor(
    message: string,
    config: AxiosRequestConfig,
    code?: string,
    request?: XMLHttpRequest,
    response?: AxiosResponse
  ) {
    super(message);
    this.name = "AxiosError";
    this.isAxiosError = true;
    this.config = config;
    this.code = code;
    this.request = request;
    this.response = response;
    Object.setPrototypeOf(this, AxiosError.prototype);
  }
}

/**
 * Interface for an interceptor handler.
 * A request interceptor receives and returns the config.
 * A response interceptor receives and returns the response or an error.
 */
export interface Interceptor<T> {
  onFulfilled?: (value: T) => T | Promise<T>;
  onRejected?: (error: any) => any;
}

export function isAxiosError(error: any): error is AxiosError {
  return error instanceof AxiosError;
}

// --- 2. InterceptorManager Class ---
// Manages the chain of interceptors.

class InterceptorManager<T> {
  private handlers: Array<Interceptor<T> | null> = [];

  /**
   * Registers a new interceptor handler.
   * @param onFulfilled The handler for a successful request/response.
   * @param onRejected The handler for a failed request/response.
   * @returns The ID of the new handler.
   */
  use(
    onFulfilled?: (value: T) => T | Promise<T>,
    onRejected?: (error: any) => any
  ): number {
    this.handlers.push({ onFulfilled, onRejected });
    return this.handlers.length - 1;
  }

  /**
   * Ejects an interceptor handler by its ID.
   * @param id The ID of the handler to eject.
   */
  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  /**
   * Iterates over all registered handlers.
   * @param fn The function to call for each handler.
   */
  forEach(fn: (handler: Interceptor<T>) => void): void {
    this.handlers.forEach((handler) => {
      if (handler !== null) {
        fn(handler);
      }
    });
  }
}

// --- 3. dispatchRequest Function ---
// Performs the actual HTTP request using XMLHttpRequest.

/**
 * Dispatches the HTTP request and returns a Promise.
 * @param config The final request configuration.
 * @returns A Promise that resolves with the response or rejects with an error.
 */
function dispatchRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = (config.method || "GET").toUpperCase();
    const url = config.url;

    // Build URL with params
    const params = config.params
      ? new URLSearchParams(config.params).toString()
      : "";
    const fullUrl = params ? `${url}?${params}` : url || "";

    xhr.open(method, fullUrl, true);

    // Set headers
    if (config.headers) {
      Object.keys(config.headers).forEach((key) => {
        xhr.setRequestHeader(key, config.headers![key]);
      });
    }

    // Handle timeout
    if (config.timeout) {
      xhr.timeout = config.timeout;
      xhr.ontimeout = () => {
        reject(new Error("Request timed out"));
      };
    }

    // Handle state changes
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const responseHeaders = xhr
          .getAllResponseHeaders()
          .split("\r\n")
          .reduce((acc, header) => {
            const [key, value] = header.split(": ");
            if (key && value) {
              acc[key.toLowerCase()] = value;
            }
            return acc;
          }, {} as Record<string, string>);

        const response: AxiosResponse = {
          data: xhr.response,
          status: xhr.status,
          statusText: xhr.statusText,
          headers: responseHeaders,
          config,
          request: xhr,
        };

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          const error = new AxiosError(
            `Request failed with status code ${xhr.status}`,
            config,
            undefined,
            xhr,
            {
              data: xhr.responseText,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: responseHeaders,
              config,
              request: xhr,
            } as AxiosResponse // 응답 객체는 에러 정보만 포함
          );
          reject(error);
        }
      }
    };

    // Handle network errors
    xhr.onerror = () => {
      reject(new AxiosError("Network Error", config, "ECONNABORTED", xhr));
    };

    // Send the request with data if available
    let requestBody = config.data;
    if (requestBody && typeof requestBody === "object") {
      requestBody = JSON.stringify(requestBody);
      xhr.setRequestHeader("Content-Type", "application/json");
    }
    xhr.send(requestBody);
  });
}

// --- 4. Axios Class ---
// The core class representing an Axios instance.

class Axios {
  public defaults: AxiosRequestConfig;
  public interceptors = {
    request: new InterceptorManager<AxiosRequestConfig>(),
    response: new InterceptorManager<AxiosResponse>(),
  };

  constructor(defaults?: AxiosRequestConfig) {
    this.defaults = defaults || {};
  }

  /**
   * The main request method that orchestrates the entire pipeline.
   * @param config The request configuration.
   * @returns A Promise that resolves with the final response.
   */
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // Create an initial promise chain
    const mergedConfig = { ...this.defaults, ...config };
    let promise = Promise.resolve(mergedConfig) as Promise<any>;

    // Add request interceptors to the front of the chain
    this.interceptors.request.forEach((handler) => {
      promise = promise.then(handler.onFulfilled, handler.onRejected);
    });

    // Add dispatchRequest function as the core of the chain
    promise = promise.then(dispatchRequest, undefined);

    // Add response interceptors to the end of the chain
    this.interceptors.response.forEach((handler) => {
      promise = promise.then(handler.onFulfilled, handler.onRejected);
    });

    // The final promise will have the type of AxiosResponse
    return promise as Promise<AxiosResponse<T>>;
  }

  // --- Convenience HTTP methods ---

  get<T = any>(
    url: string,
    config: Omit<AxiosRequestConfig, "url" | "method"> = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  post<T = any>(
    url: string,
    data?: any,
    config: Omit<AxiosRequestConfig, "url" | "method" | "data"> = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  patch<T = any>(
    url: string,
    data?: any,
    config: Omit<AxiosRequestConfig, "url" | "method" | "data"> = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  put<T = any>(
    url: string,
    data?: any,
    config: Omit<AxiosRequestConfig, "url" | "method" | "data"> = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  delete<T = any>(
    url: string,
    config: Omit<AxiosRequestConfig, "url" | "method"> = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }
}

export const axios = new Axios();

export function createAxiosInstance(defaults?: AxiosRequestConfig): Axios {
  return new Axios(defaults);
}

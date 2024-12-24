// frontend/src/shared/api/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { errorHandler } from '../errors/ErrorHandler';
import { AppError, ErrorCategory, ErrorSeverity } from '../errors/AppError';
import { API_ERROR_CODES, getErrorCodeFromStatus } from '../errors/ErrorCodes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(
          new AppError(
            'Request configuration failed',
            ErrorCategory.NETWORK,
            ErrorSeverity.ERROR,
            {
              code: API_ERROR_CODES.NETWORK_ERROR,
              originalError: error
            }
          )
        );
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        const data = response.data;
        if (data && typeof data === 'object') {
          return data;
        }
        return { success: true, data: response.data };
      },
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(
            new AppError(
              'Session expired',
              ErrorCategory.AUTHENTICATION,
              ErrorSeverity.WARNING,
              {
                code: API_ERROR_CODES.SESSION_EXPIRED,
                originalError: error
              }
            )
          );
        }

        const appError = new AppError(
          error.response?.data?.message || 'API request failed',
          this.getErrorCategory(error),
          this.getErrorSeverity(error),
          {
            code: getErrorCodeFromStatus(error.response?.status),
            originalError: error
          }
        );

        errorHandler.handleError(appError, {
          path: error.config?.url,
          action: error.config?.method?.toUpperCase()
        });

        return Promise.reject(appError);
      }
    );
  }

  private getErrorCategory(error: any): ErrorCategory {
    const status = error.response?.status;
    if (!status) return ErrorCategory.NETWORK;
    
    switch (true) {
      case status === 401:
        return ErrorCategory.AUTHENTICATION;
      case status === 403:
        return ErrorCategory.AUTHORIZATION;
      case status === 400:
      case status === 422:
        return ErrorCategory.VALIDATION;
      case status >= 500:
        return ErrorCategory.TECHNICAL;
      default:
        return ErrorCategory.BUSINESS;
    }
  }

  private getErrorSeverity(error: any): ErrorSeverity {
    const status = error.response?.status;
    if (!status) return ErrorSeverity.ERROR;

    switch (true) {
      case status >= 500:
        return ErrorSeverity.CRITICAL;
      case status === 401 || status === 403:
        return ErrorSeverity.WARNING;
      default:
        return ErrorSeverity.ERROR;
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.api.get<any, T>(url, config);
    } catch (error) {
      throw errorHandler.handleError(error);
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.api.post<any, T>(url, data, config);
    } catch (error) {
      throw errorHandler.handleError(error);
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.api.put<any, T>(url, data, config);
    } catch (error) {
      throw errorHandler.handleError(error);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.api.delete<any, T>(url, config);
    } catch (error) {
      throw errorHandler.handleError(error);
    }
  }
}

export const apiClient = new ApiClient();
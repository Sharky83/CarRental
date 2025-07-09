import axios from 'axios';
import { config } from '../config/env.js';
import toast from 'react-hot-toast';

/**
 * Enhanced API service with interceptors, error handling, and retry logic
 */
class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response time in development
        if (config.features.enableDevTools) {
          const duration = new Date() - response.config.metadata.startTime;
          console.log(`API call took ${duration}ms: ${response.config.url}`);
        }
        
        return response;
      },
      (error) => {
        return this.handleError(error);
      }
    );
  }

  handleError(error) {
    const { response, message } = error;

    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Token expired or invalid
          localStorage.removeItem('token');
          window.location.href = '/';
          toast.error('Session expired. Please login again.');
          break;
          
        case 403:
          toast.error('Access forbidden');
          break;
          
        case 404:
          toast.error('Resource not found');
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data?.message || 'An error occurred');
      }
    } else if (message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Something went wrong. Please try again.');
    }

    return Promise.reject(error);
  }

  // Generic API methods
  async get(url, config = {}) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url, data = {}, config = {}) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url, data = {}, config = {}) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete(url, config = {}) {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // File upload with progress
  async uploadFile(url, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;

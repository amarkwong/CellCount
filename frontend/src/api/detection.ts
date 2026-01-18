/**
 * API client for cell detection endpoints.
 */

import axios, { AxiosError } from 'axios';
import { DetectionResponse, HealthResponse } from '../types/detection';

// Use environment variable or default to proxy (which forwards to localhost:8000)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for large images
});

/**
 * Error response from the API
 */
interface ApiError {
  detail: string;
}

/**
 * Upload an image for cell detection.
 * @param file - The image file to analyze
 * @returns Detection results with counts and bounding boxes
 */
export async function detectCells(file: File): Promise<DetectionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post<DetectionResponse>('/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.data?.detail) {
        throw new Error(axiosError.response.data.detail);
      }
      if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Detection timed out. Please try with a smaller image.');
      }
      if (!axiosError.response) {
        throw new Error('Unable to connect to the server. Please check your connection.');
      }
    }
    throw new Error('An unexpected error occurred during detection.');
  }
}

/**
 * Check the health status of the API.
 * @returns Health status including model loading state
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error('Unable to connect to the server.');
    }
    throw new Error('Health check failed.');
  }
}

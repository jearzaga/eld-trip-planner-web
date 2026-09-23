import axios, { type AxiosError } from 'axios';

export type ApiError = {
  status: number | null;
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 90_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: Omit<ApiError, 'status'> }>) => {
    const body = error.response?.data?.error;
    const normalized: ApiError = {
      status: error.response?.status ?? null,
      code: body?.code ?? (error.response ? 'UNKNOWN_ERROR' : 'NETWORK_ERROR'),
      message: body?.message ?? 'Something went wrong. Please try again.',
      fields: body?.fields,
    };

    return Promise.reject(normalized);
  },
);

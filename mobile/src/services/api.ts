import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { Category, Entry, FinancialProfile, LoginResponse, User } from './types';

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function detectApiUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  const expoConfig = Constants.expoConfig as (typeof Constants.expoConfig & { hostUri?: string }) | null;
  const expoGoConfig = (Constants as typeof Constants & { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig;
  const hostUri = expoConfig?.hostUri || expoGoConfig?.debuggerHost;
  const host = hostUri?.split(':')[0];

  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:8000`;
  }

  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';
}

export const API_URL = detectApiUrl();

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    throw new ApiError(
      timedOut
        ? `O servidor demorou para responder (${API_URL}). Confirme se o FastAPI está ligado e se celular e PC estão na mesma rede.`
        : `Não foi possível conectar ao servidor (${API_URL}). Confirme se o FastAPI está ligado com --host 0.0.0.0 e se celular e PC estão na mesma rede.`,
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 204) return null as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.';

    if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail.map((item: any) => item?.msg).filter(Boolean).join(' ');
    }

    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  createUser: (payload: { name: string; email: string; password: string }) =>
    request<User>('/users/', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    request<LoginResponse>('/users/login', { method: 'POST', body: JSON.stringify(payload) }),

  createFinancialProfile: (payload: { user_id: number; monthly_income: number }) =>
    request<FinancialProfile>('/financial-profile/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getFinancialProfile: (userId: number) => request<FinancialProfile>(`/financial-profile/${userId}`),

  updateFinancialProfile: (userId: number, payload: { monthly_income: number }) =>
    request<FinancialProfile>(`/financial-profile/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  createCategory: (payload: { user_id: number; name: string; category_type: string }) =>
    request<Category>('/categories/', { method: 'POST', body: JSON.stringify(payload) }),

  getCategories: (userId: number) => request<Category[]>(`/categories/${userId}`),

  updateCategory: (categoryId: number, payload: { name?: string; category_type?: string }) =>
    request<Category>(`/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteCategory: (categoryId: number) =>
    request<null>(`/categories/${categoryId}`, { method: 'DELETE' }),

  createEntry: (payload: {
    user_id: number;
    category_id: number | null;
    description: string | null;
    amount: number;
    entry_type: string;
    entry_date: string;
    notes: string | null;
  }) => request<Entry>('/entries/', { method: 'POST', body: JSON.stringify(payload) }),

  getEntries: (userId: number) => request<Entry[]>(`/entries/${userId}`),

  updateEntry: (
    entryId: number,
    payload: Partial<{
      category_id: number | null;
      description: string | null;
      amount: number;
      entry_type: string;
      entry_date: string;
      notes: string | null;
    }>,
  ) => request<Entry>(`/entries/${entryId}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  deleteEntry: (entryId: number) => request<null>(`/entries/${entryId}`, { method: 'DELETE' }),
};

import { apiClient } from './client';

export interface AuthUser {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  language?: string;
  sms_enabled?: boolean;
  is_premium?: boolean;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCachedUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

function extractError(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'error' in data) {
    return String((data as { error: unknown }).error);
  }
  return fallback;
}

export async function login(
  phoneNumber: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      phone_number: phoneNumber,
      password,
    });
    setSession(data.token, data.user);
    return data;
  } catch (err) {
    throw new Error(extractError((err as any)?.response?.data, 'Failed to login'));
  }
}

export async function signup(input: {
  fullName: string;
  phoneNumber: string;
  password: string;
  email?: string;
}): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', {
      full_name: input.fullName,
      phone_number: input.phoneNumber,
      password: input.password,
      email: input.email,
    });
    setSession(data.token, data.user);
    return data;
  } catch (err) {
    throw new Error(
      extractError((err as any)?.response?.data, 'Failed to create account')
    );
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    clearSession();
  }
}

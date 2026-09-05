import { apiRequest } from './apiClient';
import type { AuthUser, SendOtpResponse, UserRole, VerifyOtpResponse } from '../types/auth';

function apiRole(role: UserRole): 'ADMIN' | 'RESIDENT' {
  return role === 'admin' ? 'ADMIN' : 'RESIDENT';
}

export async function sendOTP(mobileNumber: string, role: UserRole): Promise<SendOtpResponse> {
  const response = await apiRequest<{ success: boolean; message: string; otp?: string }>('/auth/send-otp/', {
    method: 'POST',
    body: JSON.stringify({ mobile_number: mobileNumber, role: apiRole(role) }),
  });

  return { ...response, mobileNumber };
}

export function verifyOTP(
  enteredOtp: string,
  mobileNumber: string,
  role: UserRole,
): Promise<VerifyOtpResponse> {
  return apiRequest<{
    success: boolean;
    data: Omit<VerifyOtpResponse, 'success' | 'role'>;
  }>('/auth/verify-otp/', {
    method: 'POST',
    body: JSON.stringify({ mobile_number: mobileNumber, otp: enteredOtp, role: apiRole(role) }),
  }).then((response) => {
    localStorage.setItem('metanest_access_token', response.data.access);
    localStorage.setItem('metanest_refresh_token', response.data.refresh);
    return { success: response.success, role, ...response.data };
  });
}

export function resendOTP(mobileNumber: string, role: UserRole): Promise<SendOtpResponse> {
  return apiRequest<{ success: boolean; message: string; otp?: string }>('/auth/resend-otp/', {
    method: 'POST',
    body: JSON.stringify({ mobile_number: mobileNumber, role: apiRole(role) }),
  }).then((response) => ({ ...response, mobileNumber }));
}

export function getProfile(): Promise<AuthUser> {
  return apiRequest<{ data: AuthUser }>('/auth/profile/').then((response) => response.data);
}

export function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('metanest_refresh_token');
  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token available'));
  }

  return apiRequest<{ access: string }>('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  }).then((response) => {
    localStorage.setItem('metanest_access_token', response.access);
    return response.access;
  });
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('metanest_refresh_token');
  if (refreshToken) {
    await apiRequest('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  localStorage.removeItem('metanest_access_token');
  localStorage.removeItem('metanest_refresh_token');
}

export function verifyAccessToken(token: string): Promise<{ valid: boolean }> {
  return apiRequest<{ code?: string }>('/auth/token/verify/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }).then(() => ({ valid: true }));
}
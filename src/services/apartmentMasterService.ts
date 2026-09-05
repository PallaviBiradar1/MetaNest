import { apiRequest } from './apiClient';
import type {
  Flat,
  FlatType,
  Floor,
  PaginatedResponse,
  Society,
  SocietySummary,
  Wing,
} from '../types/apartmentMaster';

const BASE = '/apartment-master';

/**
 * DRF list endpoints may or may not be paginated depending on backend settings.
 * This normalizes either shape (plain array, or { results: [...] }) into a plain array.
 */
function unwrapList<T>(response: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(response) ? response : response.results;
}

// ---- Society ----
// MVP manages exactly one Society, so getSociety() just returns the first record.

export async function getSociety(): Promise<Society | null> {
  const response = await apiRequest<Society[] | PaginatedResponse<Society>>(`${BASE}/societies/`);
  const list = unwrapList(response);
  return list[0] ?? null;
}

export function getSocietySummary(societyId: number): Promise<SocietySummary> {
  return apiRequest<SocietySummary>(`${BASE}/societies/${societyId}/summary/`);
}

export function updateSociety(societyId: number, payload: Partial<Society>): Promise<Society> {
  return apiRequest<Society>(`${BASE}/societies/${societyId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// ---- Wings ----

export async function getWings(societyId?: number): Promise<Wing[]> {
  const query = societyId ? `?society=${societyId}` : '';
  const response = await apiRequest<Wing[] | PaginatedResponse<Wing>>(`${BASE}/wings/${query}`);
  return unwrapList(response);
}

export function createWing(payload: { society: number; name: string }): Promise<Wing> {
  return apiRequest<Wing>(`${BASE}/wings/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateWing(id: number, payload: Partial<Pick<Wing, 'name'>>): Promise<Wing> {
  return apiRequest<Wing>(`${BASE}/wings/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function deleteWing(id: number): Promise<void> {
  return apiRequest<void>(`${BASE}/wings/${id}/`, { method: 'DELETE' });
}

// ---- Floors ----

export async function getFloors(wingId?: number): Promise<Floor[]> {
  const query = wingId ? `?wing=${wingId}` : '';
  const response = await apiRequest<Floor[] | PaginatedResponse<Floor>>(`${BASE}/floors/${query}`);
  return unwrapList(response);
}

export function createFloor(payload: {
  wing: number;
  floor_number: number;
  name?: string;
}): Promise<Floor> {
  return apiRequest<Floor>(`${BASE}/floors/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateFloor(
  id: number,
  payload: Partial<Pick<Floor, 'floor_number' | 'name'>>,
): Promise<Floor> {
  return apiRequest<Floor>(`${BASE}/floors/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function deleteFloor(id: number): Promise<void> {
  return apiRequest<void>(`${BASE}/floors/${id}/`, { method: 'DELETE' });
}

// ---- Flat Types ----

export async function getFlatTypes(): Promise<FlatType[]> {
  const response = await apiRequest<FlatType[] | PaginatedResponse<FlatType>>(`${BASE}/flat-types/`);
  return unwrapList(response);
}

// ---- Flats ----

export async function getFlats(filters?: {
  floor?: number;
  wing?: number;
  flat_type?: number;
}): Promise<Flat[]> {
  const params = new URLSearchParams();
  if (filters?.floor) params.set('floor', String(filters.floor));
  if (filters?.wing) params.set('wing', String(filters.wing));
  if (filters?.flat_type) params.set('flat_type', String(filters.flat_type));
  const query = params.toString() ? `?${params.toString()}` : '';

  const response = await apiRequest<Flat[] | PaginatedResponse<Flat>>(`${BASE}/flats/${query}`);
  return unwrapList(response);
}

export function createFlat(payload: {
  floor: number;
  flat_type: number;
  flat_number: string;
  carpet_area_sqft: number;
  built_up_area_sqft?: number;
  facing?: string;
}): Promise<Flat> {
  return apiRequest<Flat>(`${BASE}/flats/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateFlat(id: number, payload: Record<string, unknown>): Promise<Flat> {
  return apiRequest<Flat>(`${BASE}/flats/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function deleteFlat(id: number): Promise<void> {
  return apiRequest<void>(`${BASE}/flats/${id}/`, { method: 'DELETE' });
}
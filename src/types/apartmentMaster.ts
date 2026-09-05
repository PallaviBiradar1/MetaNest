// Mirrors apps/apartment_master/serializers.py on the backend.

export interface Society {
  id: number;
  name: string;
  registration_number: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocietySummary {
  society_id: number;
  society_name: string;
  total_wings: number;
  total_floors: number;
  total_flats: number;
  occupied_flats: number;
  vacant_flats: number;
  occupancy_percentage: number;
}

export interface Wing {
  id: number;
  society: number;
  name: string;
  total_floors: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Floor {
  id: number;
  wing: number;
  floor_number: number;
  name: string;
  total_flats: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlatType {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export type FlatFacing = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW' | '';

export interface Flat {
  id: number;
  floor: number;
  flat_type: number;
  flat_type_name: string;
  flat_number: string;
  carpet_area_sqft: string;
  built_up_area_sqft: string | null;
  facing: FlatFacing;
  occupancy_status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DRF's default pagination wraps list responses like this.
 * If the backend's ModelViewSets aren't paginated, `results` just won't be
 * present and callers should fall back to treating the response as an array.
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
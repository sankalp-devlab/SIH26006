export interface Port {
  id: number;
  name: string;
  unlocode: string | null;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  port_type: string | null;
  harbor_size?: string | null;
  facilities: string[] | null;
  created_at: string | null;
}

export interface PortSearchParams {
  name?: string;
  limit?: number;
}

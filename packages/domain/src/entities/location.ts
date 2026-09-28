export interface Location {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

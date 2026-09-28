import { z } from "zod";

export const locationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(150),
  address: z.string().max(300).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(500).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createLocationSchema = locationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLocationSchema = createLocationSchema.partial();

export type LocationInput = z.infer<typeof locationSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

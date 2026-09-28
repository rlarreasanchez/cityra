import { z } from "zod";

export const assetTypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createAssetTypeSchema = assetTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAssetTypeSchema = createAssetTypeSchema.partial();

export type AssetTypeInput = z.infer<typeof assetTypeSchema>;
export type CreateAssetTypeInput = z.infer<typeof createAssetTypeSchema>;
export type UpdateAssetTypeInput = z.infer<typeof updateAssetTypeSchema>;

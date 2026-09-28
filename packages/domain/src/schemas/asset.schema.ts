import { z } from "zod";

import { AssetStatus } from "../enums/asset-status.js";

export const assetSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
  serialNumber: z.string().max(100).optional(),
  status: z.enum(AssetStatus),
  typeId: z.string().min(1),
  locationId: z.string().min(1),
  installationDate: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createAssetSchema = assetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAssetSchema = createAssetSchema.partial();

export type AssetInput = z.infer<typeof assetSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

import type { AssetStatus } from "../enums/asset-status.js";

export interface Asset {
  id: string;
  code: string;
  name: string;
  description?: string;
  serialNumber?: string;
  status: AssetStatus;
  typeId: string;
  locationId: string;
  installationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

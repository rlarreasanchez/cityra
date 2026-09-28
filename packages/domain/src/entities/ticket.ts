import type { TicketPriority } from "../enums/ticket-priority.js";
import type { TicketStatus } from "../enums/ticket-status.js";
import type { TicketType } from "../enums/ticket-type.js";

export interface Ticket {
  id: string;
  code: string;
  type: TicketType;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;

  assetId: string;
  createdById: string;
  assignedToId?: string;

  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

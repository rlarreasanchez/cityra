import { z } from "zod";

import { TicketPriority } from "../enums/ticket-priority.js";
import { TicketStatus } from "../enums/ticket-status.js";
import { TicketType } from "../enums/ticket-type.js";

export const ticketSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(50),
  type: z.enum(TicketType),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(TicketStatus),
  priority: z.enum(TicketPriority),

  assetId: z.string().min(1),
  createdById: z.string().min(1),
  assignedToId: z.string().min(1).optional(),

  scheduledAt: z.coerce.date().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createTicketSchema = ticketSchema.omit({
  id: true,
  code: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTicketSchema = createTicketSchema.partial();

export type TicketInput = z.infer<typeof ticketSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

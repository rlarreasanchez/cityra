import { z } from "zod";

import { TicketRelationType } from "../enums/ticket-relation-type.js";

export const ticketRelationSchema = z.object({
  ticketId: z.string().min(1),
  relatedTicketId: z.string().min(1),
  type: z.enum(TicketRelationType),
});

export const createTicketRelationSchema = ticketRelationSchema;

export type TicketRelationInput = z.infer<typeof ticketRelationSchema>;
export type CreateTicketRelationInput = z.infer<
  typeof createTicketRelationSchema
>;

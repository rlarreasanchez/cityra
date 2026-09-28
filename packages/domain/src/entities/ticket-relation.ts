import type { TicketRelationType } from "../enums/ticket-relation-type.js";

export interface TicketRelation {
  ticketId: string;
  relatedTicketId: string;
  type: TicketRelationType;
}

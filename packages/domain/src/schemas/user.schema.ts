import { z } from "zod";

import { UserRole } from "../enums/user-role.js";

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  email: z.email(),
  role: z.enum(UserRole),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = createUserSchema.partial();

export type UserInput = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

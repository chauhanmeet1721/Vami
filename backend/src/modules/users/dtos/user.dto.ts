import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

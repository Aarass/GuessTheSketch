import { z } from "zod";

export const LoginDtoSchema = z.object({
  username: z.string().min(3),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

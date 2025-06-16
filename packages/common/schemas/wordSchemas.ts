import { z } from "zod";

export const AddWordDtoSchema = z.object({
  word: z.string().min(3),
});

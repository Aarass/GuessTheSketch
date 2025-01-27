import { z } from "zod";
import type { LoginDtoSchema } from "../schemas/authSchemas";

export type LoginDto = z.infer<typeof LoginDtoSchema>;

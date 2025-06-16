import { z } from "zod";
import type { AddWordDtoSchema } from "../schemas/wordSchemas.ts";

export type AddWordDto = z.infer<typeof AddWordDtoSchema>;

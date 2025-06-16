import { z } from "zod";

export const PlayerIdSchema = z.string().brand<"PlayerId">();
export type PlayerId = z.infer<typeof PlayerIdSchema>; //

export const TeamIdSchema = z.string().brand<"TeamId">();
export type TeamId = z.infer<typeof TeamIdSchema>; //

export type RoomId = string;
// type Brand<T, B> = T & { __brand: B };
// export type TeamId = Brand<string, "TeamId">;
// export type PlayerId = Brand<string, "PlayerId">;

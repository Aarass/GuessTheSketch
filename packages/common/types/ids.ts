import { z } from "zod";

export const PlayerIdSchema = z.string().brand<"PlayerId">();
export type PlayerId = z.infer<typeof PlayerIdSchema>;

export const TeamIdSchema = z.string().brand<"TeamId">();
export type TeamId = z.infer<typeof TeamIdSchema>;

export const RoomIdSchema = z.string().brand<"RoomId">();
export type RoomId = z.infer<typeof RoomIdSchema>;

export const GameIdSchema = z.string().brand<"GameId">();
export type GameId = z.infer<typeof GameIdSchema>;

export const RoundIdSchema = z.string().brand<"RoundId">();
export type RoundId = z.infer<typeof RoundIdSchema>;

export const ToolIdSchema = z.string().brand<"ToolId">();
export type ToolId = z.infer<typeof ToolIdSchema>;

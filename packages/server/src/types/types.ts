import type { DeltaScore } from "@guessthesketch/common";

export type PlayerId = string;
export type TeamId = string;
export type RoomId = string;
export type ToolId = symbol;
// type ToolType = string;

export const toolTypes = ["pen"] as const;
export type ToolType = (typeof toolTypes)[number];

export interface BroadcastMessage {
  message: string;
  drawing: any;
}

export type RoundReport = [TeamId, DeltaScore][];

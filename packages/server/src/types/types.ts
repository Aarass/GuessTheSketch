export type PlayerId = string;
export type RoomId = string;
export type ToolId = symbol;
// type ToolType = string;

export const toolTypes = ["pen"] as const;
export type ToolType = (typeof toolTypes)[number];

export interface BroadcastMessage {}

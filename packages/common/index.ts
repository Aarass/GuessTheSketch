export { LoginDtoSchema } from "./schemas/authSchemas";
export type { LoginDto } from "./types/authTypes";
export type { User } from "./types/userTypes";

export * from "./namespaces/global";
export * from "./namespaces/controls";
export * from "./namespaces/drawings";
export * from "./namespaces/chat";

export * from "./types/drawings";

export const toolTypes = ["pen"] as const;
export type ToolType = (typeof toolTypes)[number];

export interface BroadcastMessage {
  message: string;
  drawing: any;
}

export type Timestamp = number;
export type DeltaScore = number;

export type PlayerId = string;
export type TeamId = string;
export type RoomId = string;

export type TeamName = string;

export type GameConfig = {
  teams: TeamConfig[];
  rounds: RoundsConfig;
  tools: ToolConfigs;
};

export type ToolConfigs = Record<ToolType, ToolConfig>;

export type TeamConfig = {
  name: string;
  players: PlayerId[];
};

export type RoundsConfig = {
  cycles: number;
  duration: number;
};

export type ToolConfig = {
  count: number;
  consumable?: {
    maxUses: number;
  };
  timeoutable?: {
    useTime: number;
    cooldownTime: number;
  };
};

export interface LoginResult {
  id: string;
}

export type RefreshResult = LoginResult;

export type GetRoomOwnerResult =
  | {
      success: true;
      ownerId: string;
    }
  | {
      success: false;
    };

export interface JoinRoomResult {
  roomId: RoomId;
  ownerId: PlayerId;
}

export interface Player {
  id: PlayerId;
  name: string;
}

export interface Point {
  x: number;
  y: number;
}

export type RoundReport = [TeamId, DeltaScore][];

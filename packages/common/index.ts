import type { PlayerId, RoomId, TeamId } from "./types/ids";
export type { PlayerId, RoomId, TeamId };

export * from "./main";

export * from "./schemas/authSchema";
export * from "./schemas/configSchema";
export * from "./schemas/wordSchema";

export * from "./namespaces/chat";
export * from "./namespaces/controls";
export * from "./namespaces/drawings";
export * from "./namespaces/global";

export * from "./types/authTypes";
export * from "./types/drawings";
export * from "./types/user";
export * from "./types/leaderboard";

export * from "./ipc/queueNames";
export * from "./ipc/types";

export type Timestamp = number;
export type DeltaScore = number;

export interface Player {
  id: PlayerId;
  name: string;
}

export type RoundReport = [TeamId, DeltaScore][];

export type RoundReportWithWord = {
  word: string;
  report: RoundReport;
};

export interface JoinRoomResult {
  roomId: RoomId;
  ownerId: PlayerId;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// export type GetRoomOwnerResult =
//   | {
//       success: true;
//       ownerId: string;
//     }
//   | {
//       success: false;
//     };

// type _ToolTypes<L extends DrawingList> = {
//   [I in keyof L]: L[I]["type"];
// };
// export const toolTypes: _ToolTypes<DrawingList> = [
//   "freeline",
//   "line",
//   "rect",
//   "circle",
//   "dot",
//   "flood",
//   "eraser",
// ] as const;
//
// export type ToolType = (typeof toolTypes)[number];

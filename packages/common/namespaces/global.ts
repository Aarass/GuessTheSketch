import { Namespace, Socket } from "socket.io";
import type {
  GameConfig,
  Player,
  PlayerId,
  ProcessedGameConfig,
  RoundReport,
  TeamId,
} from "..";

interface ClientToServerEvents {
  ready: () => void;
  "start game": (config: GameConfig) => void;
  restore: (
    callback: (payload: {
      config: GameConfig;
      teamOnMove: TeamId | null;
    }) => void,
  ) => void;
}

interface ServerToClientEvents {
  "sync players": (players: Player[]) => void;
  "player joined room": (player: Player) => void;
  "player left room": (playerId: PlayerId) => void;
  "new owner": (owner: PlayerId) => void;
  "game not started": (error: string) => void;
  "game started": (config: ProcessedGameConfig) => void;
  "game config": (config: ProcessedGameConfig) => void;
  "game ended": () => void;
  "round started": (teamOnMove: TeamId) => void;
  "round ended": (report: RoundReport) => void;
}

export type GlobalSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type GlobalNamespace = Namespace<
  ClientToServerEvents,
  ServerToClientEvents
>;

import { Socket as CSocket } from "socket.io-client";

export type GlobalClientSocket = CSocket<
  ServerToClientEvents,
  ClientToServerEvents
>;

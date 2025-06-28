import { Namespace, Socket } from "socket.io";
import type {
  GameConfig,
  Leaderboard,
  Player,
  PlayerId,
  ProcessedGameConfig,
  RoundReport,
  RoundReportWithWord,
  TeamId,
} from "..";

interface ClientToServerEvents {
  ready: () => void;
  "start game": (config: GameConfig) => void;
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
  "rounds count": (startedRounds: number, maxRounds: number) => void;
  "round ended": (report: RoundReportWithWord) => void;
  leaderboard: (leaderboard: Leaderboard) => void;
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

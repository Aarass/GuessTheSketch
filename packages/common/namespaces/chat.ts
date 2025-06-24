import { Namespace, Socket } from "socket.io";
import { Socket as CSocket } from "socket.io-client";
import type { TeamId, PlayerId } from "../types/ids";

interface ClientToServerEvents {
  message: (message: string) => void;
}

export type ChatMessage = {
  user: string;
  message: string;
};

interface ServerToClientEvents {
  message: (message: ChatMessage) => void;
  word: (word: string) => void;
  // "start game": (config: GameConfig) => void;
  // "join-drawing-room": () => void;
  // "round-started": (drawingTeam: string) => void;
  // "round-ended": () => void;
  // "game-config-not-set": () => void;
}

export type ChatSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type ChatNamespace = Namespace<
  ClientToServerEvents,
  ServerToClientEvents
>;

export type ChatClientSocket = CSocket<
  ServerToClientEvents,
  ClientToServerEvents
>;

export interface Team {
  id: TeamId;
  name: string;
  players: Set<PlayerId>;
}

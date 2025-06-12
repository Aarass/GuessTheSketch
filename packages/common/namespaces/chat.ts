import { Namespace, Socket } from "socket.io";

interface ClientToServerEvents {
  foo: (arg: string) => void;
  CAO: () => void;
  ready: () => void;
  "start game": (config: GameConfig) => void;
  "chat message": (message: string) => void;
  "join-team": (team: string) => void;
  "join-drawing-room": () => void;
  "leave-drawing-room": () => void;
}

export type ChatMessage = {
  user: string;
  message: string;
};

interface ServerToClientEvents {
  bar: (arg: string) => void;
  "start game": (config: GameConfig) => void;
  "chat message": (message: ChatMessage) => void;
  "join-drawing-room": () => void;
  "round-started": (drawingTeam: string) => void;
  "round-ended": () => void;
  "game-config-not-set": () => void;
}

export type ChatSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type ChatNamespace = Namespace<
  ClientToServerEvents,
  ServerToClientEvents
>;

import { Socket as CSocket } from "socket.io-client";
import type { GameConfig, PlayerId, TeamId } from "..";

export type ChatClientSocket = CSocket<
  ServerToClientEvents,
  ClientToServerEvents
>;

export interface Team {
  id: TeamId;
  name: string;
  players: Set<PlayerId>;
}

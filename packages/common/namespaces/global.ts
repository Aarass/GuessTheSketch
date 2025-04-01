import { Namespace, Socket } from "socket.io";
import type { GameConfig, Player, PlayerId } from "..";

interface ClientToServerEvents {
  ready: () => void;
  "start game": (config: GameConfig) => void;
}

interface ServerToClientEvents {
  "sync players": (players: Player[]) => void;
  "player joined room": (player: Player) => void;
  "player left room": (playerId: PlayerId) => void;
  "game started": (config: GameConfig) => void;
  "game ended": () => void;
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

import { Namespace, Socket } from "socket.io";

interface ClientToServerEvents {}

interface ServerToClientEvents {
  drawing: (bm: BroadcastMessage) => void;
}

export type DrawingsSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type DrawingsNamespace = Namespace<
  ClientToServerEvents,
  ServerToClientEvents
>;

import { Socket as CSocket } from "socket.io-client";
import type { BroadcastMessage } from "..";

export type DrawingsClientSocket = CSocket<
  ServerToClientEvents,
  ClientToServerEvents
>;

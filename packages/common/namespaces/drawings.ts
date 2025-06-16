import { Namespace, Socket } from "socket.io";
import type { Drawing } from "..";

interface ClientToServerEvents {}

interface ServerToClientEvents {
  drawing: (drawing: Drawing) => void;
}

export type DrawingsSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type DrawingsNamespace = Namespace<
  ClientToServerEvents,
  ServerToClientEvents
>;

import { Socket as CSocket } from "socket.io-client";

export type DrawingsClientSocket = CSocket<
  ServerToClientEvents,
  ClientToServerEvents
>;

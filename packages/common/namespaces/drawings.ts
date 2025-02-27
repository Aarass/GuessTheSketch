import { Namespace, Socket } from "socket.io";

interface ClientToServerEvents {
  foo: (arg: string) => void;
}

interface ServerToClientEvents {
  bar: (arg: string) => void;
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

import { Namespace, Socket } from "socket.io";

interface ClientToServerEvents {
  foo: (arg: string) => void;
}

interface ServerToClientEvents {
  bar: (arg: string) => void;
}

export type ChatSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type ChatNamespace = Namespace<
  ClientToServerEvents,
  ServerToClientEvents
>;

import { Socket as CSocket } from "socket.io-client";

export type ChatClientSocket = CSocket<
  ServerToClientEvents,
  ClientToServerEvents
>;

import { Namespace, Socket } from "socket.io";
import type { ToolType } from "..";

interface ClientToServerEvents {
  foo: (arg: string) => void;
  "select tool": (toolType: ToolType) => void;
  "use tool": () => void;
  "deselect tool": () => void;
}

interface ServerToClientEvents {
  bar: (arg: string) => void;
}

export type ControlsSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type ControlsNamespace = Namespace<
  ClientToServerEvents,
  ServerToClientEvents
>;

import { Socket as CSocket } from "socket.io-client";

export type ControlsClientSocket = CSocket<
  ServerToClientEvents,
  ClientToServerEvents
>;

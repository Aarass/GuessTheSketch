import { Namespace, Socket } from "socket.io";
import type { DrawingId, NewDrawing, PlayerId, ToolType } from "..";

interface ClientToServerEvents {
  "select tool": (toolType: ToolType) => void;
  "use tool": (drawing: NewDrawing) => void;
  "deselect tool": () => void;
  "delete drawing": (id: DrawingId) => void;
}

interface ServerToClientEvents {
  "player selected tool": (playerId: PlayerId, toolType: ToolType) => void;
  "player used tool": (playerId: PlayerId, toolType: ToolType) => void;
  "player deselected tool": (playerId: PlayerId, toolType: ToolType) => void;
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

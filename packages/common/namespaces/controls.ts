import { Namespace, Socket } from "socket.io";
import type { DrawingId, NewDrawing, PlayerId, ToolType } from "..";

interface ClientToServerEvents {
  // "select tool": (toolType: ToolType) => void;
  "select tool": (
    toolType: ToolType,
    callback: (payload: { success: boolean }) => void,
  ) => void;

  // "use tool": (drawing: NewDrawing) => void;
  "use tool": (
    drawing: NewDrawing,
    callback: (payload: { success: boolean }) => void,
  ) => void;

  // "deselect tool": () => void;
  "deselect tool": (callback: (payload: { success: boolean }) => void) => void;

  // "delete drawing": (id: DrawingId) => void;
  "delete drawing": (
    id: DrawingId,
    callback: (payload: { success: boolean }) => void,
  ) => void;
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

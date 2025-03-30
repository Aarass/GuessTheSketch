import { Namespace, Socket } from "socket.io";
import type { Drawing, PlayerId, RoundReport, TeamId, ToolType } from "..";

interface ClientToServerEvents {
  "select tool": (toolType: ToolType) => void;
  "use tool": (drawing: Drawing) => void;
  "deselect tool": () => void;
}

interface ServerToClientEvents {
  "player selected tool": (playerId: PlayerId, toolType: ToolType) => void;
  "player used tool": (playerId: PlayerId, toolType: ToolType) => void;
  "player deselected tool": (playerId: PlayerId, toolType: ToolType) => void;
  "round started": (teamOnMove: TeamId) => void;
  "round ended": (report: RoundReport) => void;
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

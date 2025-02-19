import type { Server, Socket } from "socket.io";
import { GlobalState } from "../../../classes/states/GlobalState";
import type { ToolType } from "@guessthesketch/common";

export function selectTool(io: Server, socket: Socket, toolName: ToolType) {
  const userId = socket.request.session.userId;
  const roomId = socket.request.session.roomId;

  console.log(GlobalState.getInstance().getAllRooms());

  if (!roomId) return;

  const room = GlobalState.getInstance().getRoomById(roomId);
  const tool = room.getNewTool(toolName, userId);

  console.log(`User ${userId} wants to select tool: `, toolName);

  try {
    if (tool.canBeAssigned()) {
      tool.assign();
      tool.init();

      console.log(`User ${userId} selected tool`);
    }
  } catch (e) {
    console.log(e);
    socket.emit("error", `${e}`);
  }
}

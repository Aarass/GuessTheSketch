import type { Server, Socket } from "socket.io";
import { GlobalState } from "../../../classes/states/GlobalState";

export function deselectTool(io: Server, socket: Socket) {
  console.log(GlobalState.getInstance().getAllRooms());

  const sessionData = socket.request.session;
  const userId = sessionData.userId;
  const roomId = sessionData.roomId;

  if (!roomId) return;

  const room = GlobalState.getInstance().getRoomById(roomId);

  try {
    const tool = room.getPlayersTool(userId);

    if (tool === undefined) {
      throw `No tool`;
    }

    tool.deselect();
    console.log(`User ${userId} deselected tool`);
  } catch (e) {
    console.log(e);
  }
}

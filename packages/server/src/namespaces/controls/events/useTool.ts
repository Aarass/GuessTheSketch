import type { Server, Socket } from "socket.io";
import { GlobalState } from "../../../classes/states/GlobalState";

export function useTool(io: Server, socket: Socket, parameters: object) {
  console.log(GlobalState.getInstance().getAllRooms());

  const userId = socket.request.session.userId;
  const roomId = socket.request.session.roomId;

  if (!roomId) return;

  const room = GlobalState.getInstance().getRoomById(roomId);

  console.log(`User ${userId} wants to use tool`);

  try {
    const tool = room.getPlayersTool(userId);

    if (tool === undefined) throw `No tool`;

    const bm = tool.use(parameters);
    io.of("drawings").to(room.id).emit("drawing", bm);

    console.log(`User ${userId} used tool`);
  } catch (e) {
    console.log(e);
  }
}

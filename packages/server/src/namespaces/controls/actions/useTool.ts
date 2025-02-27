import type { Server, Socket } from "socket.io";
import { GlobalState } from "../../../classes/states/GlobalState";
import type { MyNamespaces } from "../../..";
import type { GuardedSocket } from "../../../utility/guarding";
import type { ControlsSocket, Drawing } from "@guessthesketch/common";

export function useTool(
  namespaces: MyNamespaces,
  socket: GuardedSocket<ControlsSocket>,
  drawing: Drawing
) {
  const state = GlobalState.getInstance();
  const userId = socket.request.session.userId;
  const roomId = socket.request.session.roomId;

  const room = state.getRoomById(roomId);

  if (room === null) {
    return console.error(`Can't use tool when room is null`);
  }

  const game = room.currentGame;
  if (game === null || game.active === false) {
    return console.error(`Can't find active game in the room`);
  }

  console.log(`User ${userId} wants to use tool`);

  // try {
  //   const tool = room.getPlayersTool(userId);

  //   if (tool === undefined) throw `No tool`;

  //   const bm = tool.use(parameters);
  //   io.of("drawings").to(room.id).emit("drawing", bm);

  //   console.log(`User ${userId} used tool`);
  // } catch (e) {
  //   console.log(e);
  // }
}

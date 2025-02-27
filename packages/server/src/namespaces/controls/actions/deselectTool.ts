import type { Server, Socket } from "socket.io";
import { GlobalState } from "../../../classes/states/GlobalState";
import type { MyNamespaces } from "../../..";
import type { GuardedSocket } from "../../../utility/guarding";
import type { ControlsSocket } from "@guessthesketch/common";

export function deselectTool(
  namespaces: MyNamespaces,
  socket: GuardedSocket<ControlsSocket>
) {
  const state = GlobalState.getInstance();
  const userId = socket.request.session.userId;
  const roomId = socket.request.session.roomId;

  const room = state.getRoomById(roomId);

  if (room === null) {
    return console.error(`Can't deselect tool when room is null`);
  }

  const game = room.currentGame;
  if (game === null || game.active === false) {
    return console.error(`Can't find active game in the room`);
  }

  console.log(`User ${userId} wants to deselect tool`);

  // TODO

  // try {
  //   const tool = room.getPlayersTool(userId);

  //   if (tool === undefined) {
  //     throw `No tool`;
  //   }

  //   tool.deselect();
  //   console.log(`User ${userId} deselected tool`);
  // } catch (e) {
  //   console.log(e);
  // }
}

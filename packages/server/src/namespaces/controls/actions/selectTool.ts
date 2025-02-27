import type { Server, Socket } from "socket.io";
import { GlobalState } from "../../../classes/states/GlobalState";
import type { ControlsSocket, ToolType } from "@guessthesketch/common";
import type { MyNamespaces } from "../../..";
import type { GuardedSocket } from "../../../utility/guarding";

export function selectTool(
  namespaces: MyNamespaces,
  socket: GuardedSocket<ControlsSocket>,
  toolName: ToolType
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

  console.log(`User ${userId} wants to select tool`);

  //TODO

  // const tool = room?.getNewTool(toolName, userId);

  // console.log(`User ${userId} wants to select tool: `, toolName);

  // try {
  //   if (tool.canBeAssigned()) {
  //     tool.assign();
  //     tool.init();

  //     console.log(`User ${userId} selected tool`);
  //   }
  // } catch (e) {
  //   console.log(e);
  //   socket.emit("error", `${e}`);
  // }
}

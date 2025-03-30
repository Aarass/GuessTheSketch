import type { ControlsSocket, ToolType } from "@guessthesketch/common";
import type { GuardedSocket } from "../../utility/guarding";
import type { MyNamespaces } from "../..";
import { checkUpToRound, getSocketContext } from "../../utility/extractor";

export function registerHandlersForControls(
  namespaces: MyNamespaces,
  socket: GuardedSocket<ControlsSocket>
) {
  socket.join(socket.request.session.roomId);

  socket.use((_, next) => {
    const [userId, , game] = getSocketContext(socket);
    const isOnMove = game?.isPlayerOnMove(userId) === true;

    if (isOnMove) {
      next();
    }
  });

  socket.on("select tool", (toolType: ToolType) => {
    const context = getSocketContext(socket);

    if (!checkUpToRound(context)) {
      console.error(`Context is not okay when trying to deselect tool`);
      return;
    }

    const [userId, room, game, round] = context;

    console.log(`User ${userId} about to select tool`);

    const selectResult = round.selectTool(toolType, userId);
    if (selectResult === true) {
      namespaces.controlsNamespace.emit(
        "player selected tool",
        userId,
        round.getPlayersTool(userId)!.toolType
      );
    }
  });

  socket.on("use tool", (drawing) => {
    const context = getSocketContext(socket);

    if (!checkUpToRound(context)) {
      console.error(`Context is not okay when trying to deselect tool`);
      return;
    }

    const [userId, room, game, round] = context;

    console.log(`User ${userId} about to use tool`);

    const useResult = round.useTool(userId, drawing);
    if (useResult !== null) {
      namespaces.controlsNamespace.emit(
        "player used tool",
        userId,
        round.getPlayersTool(userId)!.toolType
      );
      namespaces.drawingsNamespace.emit("drawing", useResult);
    }
  });

  (["disconnect", "deselect tool"] as const).forEach((event) =>
    socket.on(event, () => {
      const context = getSocketContext(socket);

      if (!checkUpToRound(context)) {
        console.error(`Context is not okay when trying to deselect tool`);
        return;
      }

      const [userId, room, game, round] = context;

      console.log(`User ${userId} about to deselect tool`);

      const toolType = round.getPlayersTool(userId)?.toolType;
      const res = round.deselectTool(userId);
      if (checkUpToRound(context)) {
        namespaces.controlsNamespace.emit(
          "player deselected tool",
          userId,
          toolType!
        );
      }
    })
  );
}

// import { toolTypes } from "../../types/types";

// function isToolType(param: string): param is ToolType {
//   for (const type in toolTypes) {
//     if (param === type) return true;
//   }
//   return false;
// }

import amqp, { connect } from "amqplib";
import {
  drawingsQueueName,
  type ControlsSocket,
  type DrawingId,
  type ToolType,
} from "@guessthesketch/common";
import type { GuardedSocket } from "../../utility/guarding";
import type { MyNamespaces } from "../..";
import { checkUpToRound, getSocketContext } from "../../utility/extractor";

const url = process.env.AMQPURL ?? "amqp://localhost";

export async function registerHandlersForControls(
  namespaces: MyNamespaces,
  socket: GuardedSocket<ControlsSocket>,
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
      namespaces.controlsNamespace
        .to(room.id)
        .emit(
          "player selected tool",
          userId,
          round.getPlayersTool(userId)!.toolType,
        );
    }
  });

  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  const { queue: drawingsQueue } = await channel.assertQueue(drawingsQueueName);

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
      namespaces.controlsNamespace
        .to(room.id)
        .emit(
          "player used tool",
          userId,
          round.getPlayersTool(userId)!.toolType,
        );
      namespaces.drawingsNamespace.to(room.id).emit("drawing", useResult);

      channel.sendToQueue(drawingsQueue, Buffer.from("asd"));
    }
  });

  socket.on("delete drawing", (id: DrawingId) => {
    console.log("Tu sam");
    const context = getSocketContext(socket);

    if (!checkUpToRound(context)) {
      console.error(`Context is not okay when trying to deselect tool`);
      return;
    }

    const [userId, room, game, round] = context;

    const useResult = round.useCommand(userId, {
      id: "" as DrawingId,
      type: "eraser",
      toDelete: id,
    });

    namespaces.drawingsNamespace.to(room.id).emit("drawing", useResult);
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
      if (res) {
        namespaces.controlsNamespace
          .to(room.id)
          .emit("player deselected tool", userId, toolType!);
      }
    }),
  );
}

// import { toolTypes } from "../../types/types";

// function isToolType(param: string): param is ToolType {
//   for (const type in toolTypes) {
//     if (param === type) return true;
//   }
//   return false;
// }

import {
  type ControlsNamespace as ControlsNamespaceType,
  type Drawing,
  type DrawingId,
  type PlayerId,
  type RoundReport,
  type TeamId,
  type ToolType,
} from "@guessthesketch/common";
import { runWithContextUpToRound } from "../../utility/extractor";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import type { Room } from "../Room";
import { NamespaceClass } from "./Base";

export class ControlsNamespace extends NamespaceClass<ControlsNamespaceType> {
  registerHandlers(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    socket.join(socket.request.session.roomId);

    this.blockOutOfTurnUsers(socket);

    socket.on("select tool", this.getOnSelectToolHandler(socket));
    socket.on("use tool", this.getOnUseToolHandler(socket));
    socket.on("delete drawing", this.getOnDeleteDrawingHandler(socket));
    socket.on("deselect tool", this.getOnDeselectToolHandler(socket));
    socket.on("disconnect", this.getOnDeselectToolHandler(socket));
  }

  public notifyRoundStarted(room: string, teamOnMoveId: TeamId) {
    this.namespace.to(room).emit("round started", teamOnMoveId);
  }

  public notifyRoundEnded(room: string, report: RoundReport) {
    this.namespace.to(room).emit("round ended", report);
  }

  public notifyPlayerSelectedTool(
    room: Room,
    userId: PlayerId,
    toolType: ToolType,
  ) {
    this.namespace.to(room.id).emit("player selected tool", userId, toolType);
  }

  public notifyPlayerUsedTool(
    room: Room,
    userId: PlayerId,
    toolType: ToolType,
  ) {
    this.namespace.to(room.id).emit("player used tool", userId, toolType);
  }

  public notifyPlayerDeselectedTool(
    room: Room,
    userId: PlayerId,
    toolType: ToolType,
  ) {
    this.namespace.to(room.id).emit("player deselected tool", userId, toolType);
  }

  private blockOutOfTurnUsers(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    socket.use((_event, next) => {
      runWithContextUpToRound(socket, (userId, _room, game) => {
        if (game.isPlayerOnMove(userId)) {
          next();
        }
      });
    });
  }

  private getOnSelectToolHandler(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    return (toolType: ToolType) => {
      runWithContextUpToRound(socket, (userId, room, _game, round) => {
        console.log(`User ${userId} about to select tool`);

        const selectResult = round.toolsManager.selectTool(toolType, userId);
        if (selectResult.isOk()) {
          this.notifyPlayerSelectedTool(room, userId, toolType);
        }
      });
    };
  }

  private getOnUseToolHandler(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    return (drawing: Drawing) => {
      runWithContextUpToRound(socket, (userId, room, _game, round) => {
        console.log(`User ${userId} about to use tool`);

        const result = round.toolsManager.useTool(userId, drawing);
        if (result.isOk()) {
          const [tool, drawing] = result.value;

          this.notifyPlayerUsedTool(room, userId, tool.toolType);
          this.messagingCenter.notifyNewDrawing(room.id, drawing);

          // TODO
          // channel.sendToQueue(drawingsQueue, Buffer.from("asd"));
        }
      });
    };
  }

  private getOnDeleteDrawingHandler(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    return (id: DrawingId) => {
      runWithContextUpToRound(socket, (userId, room, _game, round) => {
        const result = round.toolsManager.useCommand(userId, {
          id: "" as DrawingId,
          type: "eraser",
          toDelete: id,
        });

        if (result.isOk()) {
          this.messagingCenter.notifyNewDrawing(room.id, result.value);
        }
      });
    };
  }

  private getOnDeselectToolHandler(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    return () => {
      runWithContextUpToRound(socket, (userId, room, _game, round) => {
        console.log(`User ${userId} about to deselect tool`);

        const tool = round.toolsManager.getPlayersTool(userId);
        const res = round.toolsManager.deselectTool(userId);
        if (res && tool) {
          this.notifyPlayerDeselectedTool(room, userId, tool.toolType);
        }
      });
    };
  }
}

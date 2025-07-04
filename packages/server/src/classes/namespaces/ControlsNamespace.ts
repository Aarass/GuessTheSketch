import {
  type ControlsNamespace as ControlsNamespaceType,
  type DrawingId,
  type PlayerId,
  type ToolType,
  type UnvalidatedNewDrawing,
  type UnvalidatedNewDrawingWithType,
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
    this.blockOutOfTurnUsers(socket);

    socket.on("select tool", this.getOnSelectToolHandler(socket));
    socket.on("use tool", this.getOnUseToolHandler(socket));
    socket.on("delete drawing", this.getOnDeleteDrawingHandler(socket));
    socket.on("deselect tool", this.getOnDeselectToolHandler(socket));
    socket.on("disconnect", this.getOnDisconnectHandler(socket));
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
    return (
      toolType: ToolType,
      callback: (payload: { success: boolean }) => void,
    ) => {
      runWithContextUpToRound(socket, (userId, room, _game, round) => {
        console.log(`User ${userId} about to select tool`);

        const result = round.toolsManager.selectTool(toolType, userId);
        callback({ success: result.isOk() });
        if (result.isOk()) {
          this.notifyPlayerSelectedTool(room, userId, toolType);
        }
      });
    };
  }

  private getOnUseToolHandler(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    return (
      drawing: UnvalidatedNewDrawing,
      callback: (payload: { success: boolean }) => void,
    ) => {
      runWithContextUpToRound(socket, (userId, room, game, round) => {
        console.log(`User ${userId} about to use tool`);

        if (!drawing.type) {
          console.error("Validation error");
          return;
        }

        const result = round.toolsManager.useTool(
          userId,
          drawing as UnvalidatedNewDrawingWithType,
        );

        callback({ success: result.isOk() });

        if (result.isOk()) {
          const [tool, drawing] = result.value;

          this.notifyPlayerUsedTool(room, userId, tool.toolType);
          this.messagingCenter.notifyNewDrawing(
            room.id,
            game.id,
            round.id,
            drawing,
          );
        }
      });
    };
  }

  private getOnDeleteDrawingHandler(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    return (
      id: DrawingId,
      callback: (payload: { success: boolean }) => void,
    ) => {
      runWithContextUpToRound(socket, (userId, room, game, round) => {
        const result = round.toolsManager.useCommand(userId, {
          id: "" as DrawingId,
          type: "eraser",
          toDelete: id,
        });

        callback({ success: result.isOk() });
        if (result.isOk()) {
          this.messagingCenter.notifyNewDrawing(
            room.id,
            game.id,
            round.id,
            result.value,
          );
        }
      });
    };
  }

  private getOnDeselectToolHandler(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    return (callback: (payload: { success: boolean }) => void) => {
      runWithContextUpToRound(socket, (userId, room, _game, round) => {
        console.log(`User ${userId} about to deselect tool`);

        const result = round.toolsManager.deselectTool(userId);

        callback({ success: result.isOk() });
        if (result.isOk()) {
          const tool = result.value;

          this.notifyPlayerDeselectedTool(room, userId, tool.toolType);
        }
      });
    };
  }

  private getOnDisconnectHandler(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    return () => {
      runWithContextUpToRound(socket, (userId, room, _game, round) => {
        const result = round.toolsManager.deselectTool(userId);

        if (result.isOk()) {
          const tool = result.value;

          this.notifyPlayerDeselectedTool(room, userId, tool.toolType);
        }
      });
    };
  }
}

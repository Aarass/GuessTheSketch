import {
  type ControlsNamespace as ControlsNamespaceType,
  type DrawingId,
  type PlayerId,
  type RoomId,
  type ToolType,
  type UnvalidatedNewDrawing,
  type UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { err, ok, type Result } from "neverthrow";
import { runWithContextUpToRound } from "../../utility/extractor";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import type { Room } from "../Room";
import type { Round } from "../Round";
import type { Tool } from "../tools/Tool";
import { NamespaceClass } from "./Base";
import { ToolEventType } from "../tools/events/ToolEvent";
import { ToolEventListener } from "../tools/events/ToolEventListener";

export class ControlsNamespace extends NamespaceClass<ControlsNamespaceType> {
  registerHandlers(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    this.addPlayerToPlayerRoom(socket);
    this.addBlockOutOfTurnUsersMiddleware(socket);

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

  public notifyToolDeactivated(playerId: PlayerId) {
    this.namespace
      .in(this.getPlayerRoomName(playerId))
      .emit("tool deactivated");
  }

  public notifyToolStateChange(roomId: RoomId, type: ToolType, state: object) {
    this.namespace.to(roomId).emit("tool state change", type, state);
  }

  private addBlockOutOfTurnUsersMiddleware(
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
      runWithContextUpToRound(socket, (userId, _room, _game, round) => {
        console.log(`User ${userId} about to select tool`);

        // const result = round.toolsManager.selectTool(toolType, userId);

        const prevTool = round.toolsManager.getPlayersTool(userId);

        if (prevTool) {
          console.warn(`User had some tool already selected`);
          callback({ success: false });
          return;
        }

        const tool = round.toolBuilder.build(toolType);

        if (tool.checkIfEnoughResources()) {
          tool.registerListener(
            new ToolEventListener(
              new WeakRef(tool),
              round.toolsManager,
              this.messagingCenter,
            ),
          );

          tool.takeResources();
          tool.init();

          round.toolsManager.attachTool(tool, userId);
          callback({ success: true });
          return;
        } else {
          console.warn(`No enough resources`);
          callback({ success: false });
          return;
        }

        // Ovo mislim da je ona stara ideja da obavestim ostale igrace da je korisnik selektovao tool.
        // Mislim da mi vise nije potrebno, sada kada saljem svima tool state a korisniku koji je zahtevao select, saljem rezultat preko callbacka
        // if (result.isOk()) {
        //   this.notifyPlayerSelectedTool(room, userId, toolType);
        // }
      });
    };
  }

  private getOnUseToolHandler(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    return (
      _drawing: UnvalidatedNewDrawing,
      callback: (payload: { success: boolean }) => void,
    ) => {
      runWithContextUpToRound(socket, (userId, room, game, round) => {
        console.log(`User ${userId} about to use tool`);

        if (!_drawing.type) {
          console.error("Validation error");
          return;
        }
        const drawing = _drawing as UnvalidatedNewDrawingWithType;

        const tool = round.toolsManager.getPlayersTool(userId);

        if (tool === undefined) {
          console.warn(`User tried to use tool, but has no selected tool`);
          callback({ success: false });
          return;
        }

        const result = tool.use(drawing);

        callback({ success: result.isOk() });

        if (result.isOk()) {
          const drawing = result.value;

          // Ista prica
          // this.notifyPlayerUsedTool(room, userId, tool.toolType);

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
      runWithContextUpToRound(socket, (_userId, room, game, round) => {
        // const result = round.toolsManager.useCommand(userId, {
        const tool = round.toolBuilder.build("eraser");

        const result = tool.use({
          type: "eraser",
          toDelete: id,
        });

        // TODO
        // mislim da je potrebno dodati check za resurse
        // i potrebno je videti da li je potrebno kreirati neki escape hatch zbog npr. timeoutable eraser lupam. mozda samo zabraniti tu kombinaciju

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

        const result = this.deselectTool(round, userId);

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
        const result = this.deselectTool(round, userId);

        if (result.isOk()) {
          const tool = result.value;

          this.notifyPlayerDeselectedTool(room, userId, tool.toolType);
        }
      });
    };
  }

  private deselectTool(round: Round, playerId: PlayerId): Result<Tool, string> {
    const tool = round.toolsManager.getPlayersTool(playerId);

    if (tool === undefined) {
      return err(`Nothing to deselect`);
    }

    round.toolsManager.detachTool(playerId);
    tool.releaseResources();

    return ok(tool);
  }

  private addPlayerToPlayerRoom(
    socket: GuardedSocket<ExtractSocketType<ControlsNamespaceType>>,
  ) {
    void socket.join(this.getPlayerRoomName(socket.request.session.userId));
  }

  private getPlayerRoomName(playerId: PlayerId) {
    return `user:${playerId}`;
  }
}

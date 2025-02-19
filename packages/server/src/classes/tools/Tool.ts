import type {
  ToolType,
  BroadcastMessage,
  RoomId,
  PlayerId,
} from "../../types/types";
import { GlobalState } from "../states/GlobalState";

/**
 * This class is made because of the Decorator pattern, so that it
 * forces the Decorator class to implement all of the methods required,
 * and hopefully reduce the chance of introducing bugs.
 */
export abstract class DecoratorTool {
  id: symbol = Symbol();

  abstract toolType: ToolType;

  abstract canBeAssigned(): boolean;
  abstract init(): void;
  abstract use(param: any): any;
  abstract releaseTool(): void;
  abstract releaseResources(): void;
  abstract getBroadcastMessage(param: any): BroadcastMessage;

  constructor(
    public roomId: RoomId,
    public playerId: PlayerId
  ) {}
}

export abstract class Tool {
  id: symbol = Symbol();

  abstract toolType: ToolType;

  constructor(
    public roomId: RoomId,
    public playerId: PlayerId
  ) {}

  canBeAssigned(): boolean {
    const room = GlobalState.getInstance().getRoomById(this.roomId);

    if (room.playerHoldsTool(this.playerId)) {
      return false;
    }

    if (!room.hasAvailableToolsOfType(this.toolType)) {
      return false;
    }

    return true;
  }

  assign() {
    const room = GlobalState.getInstance().getRoomById(this.roomId);
    room.assignTool(this);
  }

  /**
   * Init is called once a tool is attached and ready.
   */
  abstract init(): void;

  // -----------------------
  // --- Template method ---
  // -----------------------
  use(param: any) {
    const roomState = GlobalState.getInstance().getRoomById(this.roomId);
    const toolState = roomState.getToolState(this.toolType);
    toolState.timesUsed++;

    return this.getBroadcastMessage(param);
  }

  deselect() {
    this.releaseTool();
    this.releaseResources();
  }

  releaseTool() {
    const room = GlobalState.getInstance().getRoomById(this.roomId);
    room.detachToolFromPlayer(this.playerId);
  }

  releaseResources() {
    const room = GlobalState.getInstance().getRoomById(this.roomId);
    room.restoreToolAvailability(this.toolType);
  }

  abstract getBroadcastMessage(param: any): BroadcastMessage;
}

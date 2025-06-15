import {
  type BroadcastMessage,
  type Eraser,
  type PlayerId,
  type ToolType,
} from "@guessthesketch/common";
import { ToolState } from "./states/ToolState";
import { Tool } from "./tools/Tool";
import type { ToolBuilder } from "./tools/ToolBuilder";
import { err, ok, Ok, Result } from "neverthrow";

export class ToolsManager {
  private inventory: Map<PlayerId, Tool> = new Map();

  constructor(
    private toolBuilder: ToolBuilder,
    private toolStates: Record<ToolType, ToolState>,
  ) {}

  private attachTool(tool: Tool, playerId: PlayerId): Ok<void, any> {
    this.inventory.set(playerId, tool);

    return ok();
  }

  public detachTool(playerId: PlayerId): Ok<void, any>;
  public detachTool(tool: Tool): Ok<void, any>;

  public detachTool(param: PlayerId | Tool) {
    if (typeof param === "object") {
      const entry = this.inventory
        .entries()
        .find((entry) => entry[1] === param);

      if (entry) {
        this.inventory.delete(entry[0]);
      }
    } else {
      this.inventory.delete(param);
    }

    return ok();
  }

  public selectTool(
    toolType: ToolType,
    playerId: PlayerId,
  ): Result<void, string> {
    const prevTool = this.getPlayersTool(playerId);

    if (prevTool) {
      return err(`User had some tool already selected`);
    }

    const tool = this.toolBuilder.build(toolType, this);

    if (tool.checkIfEnoughResources()) {
      tool.takeResources();
      tool.init();

      this.attachTool(tool, playerId);
      return ok();
    } else {
      return err(`No enough resources`);
    }
  }

  public useTool(
    playerId: PlayerId,
    drawing: any,
  ): Result<readonly [Tool, BroadcastMessage], string> {
    const tool = this.inventory.get(playerId);

    if (tool === undefined) {
      return err(`User tried to use tool, but has no selected tool`);
    }

    const result = tool.use(drawing);

    return result.map((drawing) => [tool, drawing]);
  }

  // TODO
  // Ovo postoji jer komanda treba da bude dostupna svim igracima.
  // U sustini ispod je sve isto kao obican tool, ali nema selektovanja i deselektovanja
  public useCommand(
    _playerId: PlayerId,
    command: Eraser,
  ): Result<BroadcastMessage, any> {
    const tool = this.toolBuilder.build(command.type, this);

    return tool.use(command);
  }

  public deselectTool(playerId: PlayerId): Result<void, string> {
    const tool = this.getPlayersTool(playerId);

    if (tool === undefined) {
      return err(`Nothing to deselect`);
    }

    this.detachTool(playerId);
    tool.releaseResources();

    return ok();
  }

  public getPlayersTool(playerId: PlayerId): Tool | undefined {
    return this.inventory.get(playerId);
  }

  public getToolState(toolType: ToolType): ToolState {
    return this.toolStates[toolType];
  }
}

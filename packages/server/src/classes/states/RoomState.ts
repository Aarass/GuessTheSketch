import { type RoomConfig, ToolBuilder } from "../../tmp";
import {
  type PlayerId,
  type RoomId,
  type ToolType,
  toolTypes,
} from "../../types/types";
import { Tool } from "../tools/Tool";
import { GlobalState } from "./GlobalState";
import { ToolState } from "./ToolState";

export class RoomState {
  public id: RoomId;

  private toolMap = new Map<PlayerId, Tool>();

  private toolStates: {
    [key in ToolType]: ToolState;
  };

  private toolBuilders: {
    [key in ToolType]: ToolBuilder;
  };

  constructor(config: RoomConfig) {
    // TODO
    this.id = `${Math.round(Math.random() * 1000)}`;

    // @ts-ignore
    this.toolBuilders = {};
    // @ts-ignore
    this.toolStates = {};

    for (const type of toolTypes) {
      const conf = config[type];

      this.toolBuilders[type] = new ToolBuilder(this.id, type, conf);
      this.toolStates[type] = new ToolState(conf);
    }
  }

  getNewTool(toolType: ToolType, playerId: PlayerId): Tool {
    return this.toolBuilders[toolType].build(playerId);
  }

  getPlayersTool(playerId: PlayerId): Tool | undefined {
    return this.toolMap.get(playerId);
  }

  getToolState(toolType: ToolType) {
    return this.toolStates[toolType];
  }

  playerHoldsTool(playerId: PlayerId): boolean {
    return this.toolMap.get(playerId) !== undefined;
  }

  hasAvailableToolsOfType(toolType: ToolType): boolean {
    return this.toolStates[toolType].toolsLeft > 0;
  }

  assignTool(tool: Tool) {
    this.toolMap.set(tool.playerId, tool);
    this.toolStates[tool.toolType].toolsLeft--;
  }

  detachToolFromPlayer(playerId: PlayerId) {
    this.toolMap.delete(playerId);
  }

  restoreToolAvailability(toolType: ToolType) {
    this.toolStates[toolType].toolsLeft++;
  }
}

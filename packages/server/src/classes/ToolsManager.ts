import { type PlayerId } from "@guessthesketch/common";
import { err, ok, Ok, Result } from "neverthrow";
import { Tool } from "./tools/Tool";

// TODO - Dangerous
export class ToolsManager {
  private inventory: Map<PlayerId, Tool> = new Map();

  constructor() {}

  public attachTool(tool: Tool, playerId: PlayerId): Ok<void, never> {
    this.inventory.set(playerId, tool);

    return ok();
  }

  public detachTool(playerId: PlayerId): Ok<void, never>;
  public detachTool(tool: Tool): Ok<void, never>; // eslint-disable-line @typescript-eslint/unified-signatures

  /**
   * **Dangerous**
   * @warning **Unsafe**. Should not be used. Will be removed asap
   */
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

  public deselectTool(playerId: PlayerId): Result<Tool, string> {
    const tool = this.getPlayersTool(playerId);

    if (tool === undefined) {
      return err(`Nothing to deselect`);
    }

    this.detachTool(playerId);
    tool.releaseResources();

    return ok(tool);
  }

  public getPlayersTool(playerId: PlayerId): Tool | undefined {
    return this.inventory.get(playerId);
  }

  /**
   * **Dangerous**
   * @warning **Unsafe**. Should not be used. Will be removed asap
   */
  public getToolsPlayer(tool: Tool): PlayerId | undefined {
    return this.inventory.entries().find((entry) => entry[1] === tool)?.[0];
  }
}

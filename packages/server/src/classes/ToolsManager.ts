import { type PlayerId } from "@guessthesketch/common";
import { ok, Ok } from "neverthrow";
import { Tool } from "./tools/Tool";

export class ToolsManager {
  private inventory: Map<PlayerId, Tool> = new Map();

  constructor() {}

  public attachTool(tool: Tool, playerId: PlayerId): Ok<void, never> {
    this.inventory.set(playerId, tool);

    return ok();
  }

  public detachTool(playerId: PlayerId): Ok<void, never>;
  public detachTool(tool: Tool): Ok<void, never>; // eslint-disable-line @typescript-eslint/unified-signatures

  public detachTool(param: PlayerId | Tool) {
    if (typeof param === "object") {
      const entry = this.inventory
        .entries()
        .find((entry) => entry[1].id === param.id);

      if (entry) {
        this.inventory.delete(entry[0]);
      }
    } else {
      this.inventory.delete(param);
    }

    return ok();
  }

  public getPlayersTool(playerId: PlayerId): Tool | undefined {
    return this.inventory.get(playerId);
  }

  public getToolsOwner(tool: Tool): PlayerId | undefined {
    return this.inventory
      .entries()
      .find((entry) => entry[1].id === tool.id)?.[0];
  }
}

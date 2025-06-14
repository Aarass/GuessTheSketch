import type { ToolType } from "@guessthesketch/common";
import type { Tool } from "./tools/Tool";
import type { ToolsManager } from "./ToolsManager";

export class ToolRegistry {
  private map: RegistryMap = {};

  public registerTool(type: ToolType, constructor: ToolConstructor) {
    this.map[type] = constructor;
  }

  public getToolConstructor(type: ToolType): ToolConstructor {
    const tool = this.map[type];

    if (!tool) throw new Error(`Tool ${type} not registered`);

    return tool;
  }

  // -----------------
  // --- Singleton ---
  // -----------------
  private static instance: ToolRegistry | null = null;

  private constructor() {}

  static getInstance() {
    if (this.instance == null) {
      this.instance = new ToolRegistry();
    }
    return this.instance;
  }
}

type ToolConstructor = new (manager: ToolsManager) => Tool;

type RegistryMap = Partial<{
  [key in ToolType]: ToolConstructor;
}>;

// private static map: {
//   [key in ToolType]: new (round: Round) => Tool;
// } = {
//   pen: Pen,
//   eraser: Eraser,
// };
//

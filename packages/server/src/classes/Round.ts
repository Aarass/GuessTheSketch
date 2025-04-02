import {
  toolTypes,
  type BroadcastMessage,
  type PlayerId,
  type Timestamp,
  type ToolConfigs,
  type ToolType,
  type RoundReport,
  type TeamId,
  type Eraser,
} from "@guessthesketch/common";
import type { Evaluator } from "./evaluators/Evaluator";
import { ToolBuilder } from "./tools/ToolBuilder";
import type { Game } from "./Game";
import type { Tool } from "./tools/Tool";
import { ToolState } from "./states/ToolState";

export class Round {
  private word: string | null = null;

  private startTimestamp: Timestamp | null = null;
  private hitTimestamps: Map<TeamId, Timestamp> = new Map();

  private inventory: Map<PlayerId, Tool> = new Map();
  private toolStates: Record<ToolType, ToolState>;

  /**
   * @param evaluator Object used to calculate score
   */
  constructor(
    public game: Game,
    private toolConfigs: ToolConfigs,
    private evaluator: Evaluator
  ) {
    this.toolStates = {} as any;
    for (const type of toolTypes) {
      this.toolStates[type] = new ToolState(this.toolConfigs[type]);
    }
  }

  attachTool(tool: Tool, playerId: PlayerId) {
    this.inventory.set(playerId, tool);
  }

  detachTool(playerId: PlayerId): void;
  detachTool(tool: Tool): void;

  detachTool(param: PlayerId | Tool) {
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
  }

  getPlayersTool(playerId: PlayerId): Tool | undefined {
    return this.inventory.get(playerId);
  }

  getToolState(toolType: ToolType): ToolState {
    return this.toolStates[toolType];
  }

  selectTool(toolType: ToolType, playerId: PlayerId): boolean {
    const prevTool = this.getPlayersTool(playerId);

    if (prevTool) {
      console.log("User had some tool already selected");
      return false;
    }

    const config = this.toolConfigs[toolType];

    const tool = ToolBuilder.build(toolType, this, config);

    if (tool.canBeAssigned()) {
      this.attachTool(tool, playerId);
      tool.takeResources();
      tool.init();
      return true;
    } else {
      return false;
    }
  }

  useTool(playerId: PlayerId, drawing: any): BroadcastMessage | null {
    const tool = this.inventory.get(playerId);

    if (tool === undefined) {
      console.error("User tried to use tool, but has no selected tool");
      return null;
    }

    return tool.use(drawing);
  }

  useCommand(playerId: PlayerId, command: Eraser) {
    const toolType = command.type;
    const config = this.toolConfigs[toolType];
    const tool = ToolBuilder.build(toolType, this, config);

    return tool.use(command);
  }

  deselectTool(playerId: PlayerId): boolean {
    const tool = this.getPlayersTool(playerId);

    if (tool === undefined) {
      return false;
    }

    this.detachTool(playerId);
    tool.releaseResources();
    return true;
  }

  start() {
    if (this.startTimestamp !== null || this.word !== null)
      throw `Trying to call start multiple times`;

    this.startTimestamp = Date.now();
    this.word = this.getWordToGuess();
  }

  hitsCount() {
    return this.hitTimestamps.size;
  }

  isCorrectGuess(guess: string) {
    if (this.word === null) throw `You forgot to call start`;

    return this.word === guess;
  }

  recordHit(teamId: TeamId) {
    if (this.hitTimestamps.get(teamId) !== undefined)
      throw `Internal error. User should not be able to guess after its team has guessed the word`;

    this.hitTimestamps.set(teamId, Date.now());
  }

  getReport(): RoundReport {
    if (this.startTimestamp === null) throw `You forgot to call start`;

    return this.evaluator.evaluate(this.startTimestamp, this.hitTimestamps);
  }

  private getWordToGuess(): string {
    // TODO
    return "house";
  }
}

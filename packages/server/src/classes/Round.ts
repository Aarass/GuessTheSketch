import type { RoundId } from "@guessthesketch/common/types/ids";
import { v4 as uuid } from "uuid";
import type { AppContext } from "./AppContext";
import { GuessingManager } from "./GuessingManager";
import { ToolBuilder } from "./tools/ToolBuilder";
import { ToolsManager } from "./ToolsManager";

export class Round {
  public readonly id: RoundId = uuid() as RoundId;

  public readonly toolsManager = new ToolsManager();

  private constructor(
    public readonly guessingManager: GuessingManager,
    public readonly toolBuilder: ToolBuilder,
  ) {}

  public static async create(ctx: AppContext, toolBuilder: ToolBuilder) {
    const guessingManager = await GuessingManager.create(ctx);

    return new Round(guessingManager, toolBuilder);
  }
}

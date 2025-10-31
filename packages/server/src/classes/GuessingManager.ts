import type { Timestamp, TeamId, RoundReport } from "@guessthesketch/common";
import type { AppContext } from "./AppContext";
import type { Evaluator } from "./evaluators/Evaluator";
import { err, ok, type Result } from "neverthrow";

export class GuessingManager {
  private startTimestamp: Timestamp | null = null;
  private hitTimestamps: Map<TeamId, Timestamp> = new Map();

  private constructor(private word: string) {
    this.startTimestamp = Date.now();
  }

  static async create(ctx: AppContext) {
    const res = await ctx.wordService.getRandomWord();
    if (!res) throw new Error("Couldn't fetch a word");

    return new GuessingManager(res.word);
  }

  public hitsCount() {
    return this.hitTimestamps.size;
  }

  public isCorrectGuess(guess: string) {
    if (this.word === null) throw new Error(`You forgot to call start`);

    return this.word === guess;
  }

  public hasTeamGuessedWord(teamId: TeamId) {
    return this.hitTimestamps.has(teamId);
  }

  public recordHit(teamId: TeamId): Result<void, string> {
    if (this.hitTimestamps.get(teamId) !== undefined) {
      return err(
        `Internal error. User should not be able to guess after its team has guessed the word`,
      );
    }

    this.hitTimestamps.set(teamId, Date.now());
    return ok();
  }

  public getReport(evaluator: Evaluator): RoundReport {
    if (this.startTimestamp === null)
      throw new Error(`You forgot to call start`);

    return evaluator.evaluate(this.startTimestamp, this.hitTimestamps);
  }

  public getWord(masked: boolean) {
    if (!this.word) {
      return null;
    }

    if (masked) {
      return "?".repeat(this.word.length);
    } else {
      return this.word;
    }
  }
}

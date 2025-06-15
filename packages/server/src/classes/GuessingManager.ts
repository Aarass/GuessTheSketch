import type { Timestamp, TeamId, RoundReport } from "@guessthesketch/common";
import type { AppContext } from "./AppContext";
import type { Evaluator } from "./evaluators/Evaluator";
import { err, ok, type Result } from "neverthrow";

export class GuessingManager {
  private word: string | null = null;
  private startTimestamp: Timestamp | null = null;
  private hitTimestamps: Map<TeamId, Timestamp> = new Map();

  constructor(private ctx: AppContext) {}

  async init() {
    if (this.startTimestamp !== null || this.word !== null)
      throw new Error(`Trying to call init multiple times`);

    this.startTimestamp = Date.now();
    this.word = await this.getRandomWordToGuess();
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

  private async getRandomWordToGuess() {
    const res = await this.ctx.wordService.getRandomWord();

    if (res) {
      return res.word;
    } else {
      // Mozda da ne ubijem server?
      throw new Error("Couldn't fetch a word");
    }
  }
}

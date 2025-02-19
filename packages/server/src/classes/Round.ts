import type { Timestamp } from "@guessthesketch/common";
import type { TeamId, RoundReport } from "../types/types";
import type { Evaluator } from "./evaluators/Evaluator";

export class Round {
  private startTimestamp: Timestamp | null = null;
  private hitTimestamps: Map<TeamId, Timestamp> = new Map();
  private word: string | null = null;

  /**
   * @param evaluator Object used to calculate score
   */
  constructor(private evaluator: Evaluator) {}

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

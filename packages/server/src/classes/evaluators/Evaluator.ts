import type { TeamId, Timestamp, RoundReport } from "@guessthesketch/common";

// ----------------
// --- Strategy ---
// ----------------
export abstract class Evaluator {
  private teamOnMove: TeamId | null = null;

  public setTeamOnMove(id: TeamId) {
    this.teamOnMove = id;
  }

  evaluate(
    start: Timestamp,
    hitTimestamps: Map<TeamId, Timestamp>,
  ): RoundReport {
    if (this.teamOnMove === null) {
      throw new Error(`Internal error. You didn't set team on move`);
    }

    const res = this._evaluate(this.teamOnMove, start, hitTimestamps);

    this.teamOnMove = null;
    return res;
  }

  abstract _evaluate(
    teamOnMove: TeamId,
    start: Timestamp,
    hitTimestamps: Map<TeamId, Timestamp>,
  ): RoundReport;
}

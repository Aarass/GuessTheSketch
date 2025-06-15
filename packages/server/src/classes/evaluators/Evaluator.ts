import type { TeamId, Timestamp, RoundReport } from "@guessthesketch/common";

// ----------------
// --- Strategy ---
// ----------------
export abstract class Evaluator {
  abstract evaluate(
    start: Timestamp,
    hitTimestamps: Map<TeamId, Timestamp>,
  ): RoundReport;
}

export class MockEvaluator extends Evaluator {
  evaluate(
    _start: Timestamp,
    _hitTimestamps: Map<TeamId, Timestamp>,
  ): RoundReport {
    return [["asd" as TeamId, 0]];
  }
}

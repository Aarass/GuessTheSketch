import type { TeamId, Timestamp } from "@guessthesketch/common";
import type { RoundReport } from "../../types/types";

// ----------------
// --- Strategy ---
// ----------------
export abstract class Evaluator {
  abstract evaluate(
    start: Timestamp,
    hitTimestamps: Map<TeamId, Timestamp>
  ): RoundReport;
}

export class MockEvaluator extends Evaluator {
  evaluate(
    start: Timestamp,
    hitTimestamps: Map<TeamId, Timestamp>
  ): RoundReport {
    return [["asd", 0]];
  }
}

import type { TeamId, Timestamp, RoundReport } from "@guessthesketch/common";
import { Evaluator } from "./Evaluator";

export class MockEvaluator extends Evaluator {
  _evaluate(
    _teamOnMove: TeamId,
    _start: Timestamp,
    _hitTimestamps: Map<TeamId, Timestamp>,
  ): RoundReport {
    return [];
  }
}

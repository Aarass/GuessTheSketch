import type { RoundReport, TeamId, Timestamp } from "@guessthesketch/common";
import { Evaluator } from "./Evaluator";

export class SimpleEvaluator extends Evaluator {
  _evaluate(
    teamOnMove: TeamId,
    _start: Timestamp,
    hitTimestamps: Map<TeamId, Timestamp>,
  ): RoundReport {
    if (hitTimestamps.size === 0) return [];

    let res: RoundReport = [[teamOnMove, hitTimestamps.size * 100]];

    for (const [teamId, _timestamp] of hitTimestamps) {
      res.push([teamId, 100]);
    }

    return res;
  }
}

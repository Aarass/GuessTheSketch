import type {
  LeaderboardRecord,
  RoundReport,
  Team,
} from "@guessthesketch/common";

export class Leaderboard {
  private leaderboard: LeaderboardRecord;

  constructor(teams: Team[]) {
    this.leaderboard = Object.fromEntries(teams.map((team) => [team.id, 0]));
  }

  public getRecord() {
    return { ...this.leaderboard } as LeaderboardRecord;
  }

  public update(report: RoundReport) {
    for (const [teamId, deltaScore] of report) {
      if (this.leaderboard[teamId] !== undefined) {
        this.leaderboard[teamId] += deltaScore;
      } else {
        console.log("report sadrzi teamid kojeg nema u leaderboard");
      }
    }
  }
}

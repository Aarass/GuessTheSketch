import {
  type PlayerId,
  type Team,
  type TeamConfig,
  type TeamId,
} from "@guessthesketch/common";
import { v4 as uuid } from "uuid";

export class TeamsManager {
  private teams: Team[];
  private currentTeamIndex: number = -1;

  constructor(config: TeamConfig[]) {
    this.teams = config.map((tc) => ({
      id: uuid() as TeamId,
      name: tc.name,
      players: new Set(tc.players),
    }));
  }

  public getTeams() {
    return this.teams;
  }

  public getTeamsCount() {
    return this.teams.length;
  }

  public getTeamOnMove() {
    return this.teams[this.currentTeamIndex];
  }

  public isPlayerOnMove(player: PlayerId): boolean {
    const team = this.findPlayersTeam(player);

    if (!team) {
      console.error("Player has no team");
      return false;
    }

    return this.isTeamOnMove(team.id);
  }

  public isTeamOnMove(team: TeamId): boolean {
    return team === this.teams[this.currentTeamIndex].id;
  }

  public findPlayersTeam(playerId: PlayerId): Team | undefined {
    return this.teams.find((team) => team.players.has(playerId));
  }

  public cycleToNextTeam() {
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
  }
}

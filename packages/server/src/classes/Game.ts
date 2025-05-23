import type { GameConfig, TeamId, PlayerId } from "@guessthesketch/common";
import type { Room } from "./Room";
import { v4 as uuid } from "uuid";
import { Round } from "./Round";
import { Evaluator, MockEvaluator } from "./evaluators/Evaluator";

export class Game {
  public active: boolean = false;

  private teams: Team[];
  private currentTeamIndex: number = -1;

  public round: Round | null = null;
  private startedRounds = 0;
  private endRoundTimer: Timer | null = null;

  private leaderboard: Record<TeamId, number>;

  constructor(
    private config: GameConfig,
    public room: Room,
    private evaluator: Evaluator = new MockEvaluator()
  ) {
    this.teams = config.teams.map((teamConfig) => {
      return {
        id: uuid() as TeamId,
        name: teamConfig.name,
        players: new Set(teamConfig.players),
      };
    });

    this.leaderboard = Object.fromEntries(
      this.teams.map((team) => {
        return [team.id, 0];
      })
    );
  }

  start() {
    if (this.startedRounds !== 0)
      throw `Calling game.start() when startedRounds is not 0`;

    this.active = true;
    console.log("Game started");

    this.room.emitToGlobal("game started", {
      ...this.config,
      teams: this.teams.map((team) => {
        return {
          id: team.id,
          name: team.name,
          players: Array.from(team.players.values()),
        };
      }),
    });

    setTimeout(() => {
      this.startNewRound();
    }, 2000);
  }

  isPlayerOnMove(player: PlayerId): boolean {
    const currentTeam = this.teams[this.currentTeamIndex];
    const team = this.findPlayersTeam(player);

    return team === currentTeam;
  }

  guess(guess: string, playerId: PlayerId) {
    if (this.round === null) throw `Trying to guess word while round is null`;

    if (!this.active) throw `Trying to guess when game is not active`;

    if (this.round.isCorrectGuess(guess)) {
      const team = this.findPlayersTeam(playerId);
      if (team === null) throw `Can't find players team`;

      this.round.recordHit(team.id);

      if (this.round.hitsCount() === this.teams.length) {
        if (this.endRoundTimer === null)
          throw `endRoundTimer has never been set`;

        clearInterval(this.endRoundTimer);
        this.roundEnded();
      }
    }
  }

  private startNewRound() {
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
    this.round = new Round(this, this.config.tools, this.evaluator);
    this.round.start();

    this.endRoundTimer = setTimeout(() => {
      this.roundEnded();
    }, this.config.rounds.duration);

    this.startedRounds++;
    console.log("Round started");

    const teamOnMove = this.teams[this.currentTeamIndex];
    const tmp = teamOnMove.id;

    this.room.emitToControls("round started", teamOnMove.id);
    this.room.setupRoundRooms(this.teams[this.currentTeamIndex]);
    this.room.emitToChat("round-started", this.teams[this.currentTeamIndex].name);
  }

  private roundEnded() {
    console.log("Round ended");
    if (this.round === null) throw `Round is null in roundEnded handler`;

    const report = this.round.getReport();

    this.room.emitToControls("round ended", report);
    this.room.emitToChat("round-ended");

    const maxRounds = this.teams.length * this.config.rounds.cycles;
    if (this.startedRounds !== maxRounds) {
      this.startNewRound();
    } else {
      this.round = null;
      this.gameEnded();
    }
  }

  private gameEnded() {
    console.log("Game end");

    this.active = false;
    this.room.emitToGlobal("game ended");
  }

  findPlayersTeam(playerId: PlayerId): Team | null {
    for (const team of this.teams) {
      if (team.players.has(playerId)) {
        return team;
      }
    }
    return null;
  }

  public getCurrentRound(): Round | null{
    return this.round;
  }

  getdrawingTeamName(): string | null{
    return this.teams[this.currentTeamIndex].name
  }

  getGameConfig(): GameConfig | null {
    return this.config;
  }

}

export interface Team {
  id: TeamId;
  name: string;
  players: Set<PlayerId>;
}

import type {
  GameConfig,
  PlayerId,
  Team,
  TeamId,
} from "@guessthesketch/common";
import { v4 as uuid } from "uuid";
import { Evaluator, MockEvaluator } from "./evaluators/Evaluator";
import type { MessagingCenter } from "./MessagingCenter";
import type { Room } from "./Room";
import { Round } from "./Round";
import type { AppContext } from "./AppContext";

export class Game {
  public active: boolean = false;

  private teams: Team[];
  private currentTeamIndex: number = -1;

  private _currentRound: Round | null = null;
  public get currentRound() {
    return this._currentRound;
  }
  private startedRounds = 0;
  private endRoundTimer: Timer | null = null;

  private leaderboard: Record<TeamId, number>;

  constructor(
    private ctx: AppContext,
    private config: GameConfig,
    private room: Room,
    private messagingCenter: MessagingCenter,
    private evaluator: Evaluator = new MockEvaluator(),
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
      }),
    );
  }

  public start() {
    if (this.startedRounds !== 0)
      throw `Calling game.start() when startedRounds is not 0`;

    this.active = true;

    console.log("Game started");

    const config = {
      ...this.config,
      teams: this.teams.map((team) => {
        return {
          id: team.id,
          name: team.name,
          players: Array.from(team.players.values()),
        };
      }),
    };

    this.messagingCenter.notifyGameStarted(this.room.id, config);

    setTimeout(() => {
      this.startNewRound();
    }, 2000);
  }

  public isPlayerOnMove(player: PlayerId): boolean {
    const currentTeam = this.teams[this.currentTeamIndex];
    const team = this.findPlayersTeam(player);

    return team === currentTeam;
  }

  public isTeamOnMove(team: TeamId): boolean {
    return team === this.teams[this.currentTeamIndex].id;
  }

  public guess(guess: string, playerId: PlayerId) {
    if (this._currentRound === null)
      throw `Trying to guess word while round is null`;

    if (!this.active) throw `Trying to guess when game is not active`;

    const isCorrectGuess = this._currentRound.isCorrectGuess(guess);

    if (isCorrectGuess) {
      const team = this.findPlayersTeam(playerId);
      if (team === null) throw `Can't find players team`;

      this._currentRound.recordHit(team.id);

      const maxHits = this.teams.length - 1;
      if (this._currentRound.hitsCount() === maxHits) {
        if (this.endRoundTimer === null)
          throw `endRoundTimer has never been set`;

        clearInterval(this.endRoundTimer);
        this.roundEnded();
      }
    }

    return isCorrectGuess;
  }

  private async startNewRound() {
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;

    this._currentRound = new Round(
      this,
      this.ctx,
      this.config.tools,
      this.messagingCenter,
    );

    this._currentRound.start();

    this.endRoundTimer = setTimeout(() => {
      this.roundEnded();
    }, this.config.rounds.duration);

    this.startedRounds++;
    console.log("Round started");

    const teamOnMove = this.teams[this.currentTeamIndex];

    this.messagingCenter.notifyRoundStarted(this.room.id, teamOnMove);
  }

  private roundEnded() {
    console.log("Round ended");
    if (this._currentRound === null)
      throw `Round is null in roundEnded handler`;

    const report = this._currentRound.getReport(this.evaluator);

    this.messagingCenter.notifyRoundEnded(this.room.id, report);

    const maxRounds = this.teams.length * this.config.rounds.cycles;
    if (this.startedRounds !== maxRounds) {
      this.startNewRound();
    } else {
      this._currentRound = null;
      this.gameEnded();
    }
  }

  private gameEnded() {
    console.log("Game end");

    this.active = false;

    this.messagingCenter.notifyGameEnded(
      this.room.id,
      this.teams.map((t) => t.id),
    );
  }

  public findPlayersTeam(playerId: PlayerId): Team | null {
    for (const team of this.teams) {
      if (team.players.has(playerId)) {
        return team;
      }
    }
    return null;
  }
}

import type {
  GameConfig,
  PlayerId,
  ProcessedGameConfig,
  Team,
  TeamId,
} from "@guessthesketch/common";
import { v4 as uuid } from "uuid";
import { Evaluator, MockEvaluator } from "./evaluators/Evaluator";
import type { MessagingCenter } from "./MessagingCenter";
import type { Room } from "./Room";
import { Round } from "./Round";
import type { AppContext } from "./AppContext";
import { RoundFactory } from "./RoundFactory";
import { err, ok, type Result } from "neverthrow";

export class Game {
  public active: boolean = false;

  private teams: Team[];
  private currentTeamIndex: number = -1;

  private roundFactory;

  private roundDuration;
  private maxRounds;

  private _currentRound: Round | null = null;
  public get currentRound() {
    return this._currentRound;
  }
  private startedRounds = 0;
  private endRoundTimer: Timer | null = null;

  private leaderboard: Record<TeamId, number>;

  constructor(
    ctx: AppContext,
    private config: GameConfig,
    private room: Room,
    private messagingCenter: MessagingCenter,
    private evaluator: Evaluator = new MockEvaluator(),
  ) {
    this.roundFactory = new RoundFactory(config.tools, ctx);

    this.teams = config.teams.map((teamConfig) => {
      return {
        id: uuid() as TeamId,
        name: teamConfig.name,
        players: new Set(teamConfig.players),
      };
    });

    this.maxRounds = this.teams.length * config.rounds.cycles;
    this.roundDuration = config.rounds.duration;

    this.leaderboard = Object.fromEntries(
      this.teams.map((team) => {
        return [team.id, 0];
      }),
    );
  }

  public start() {
    if (this.startedRounds !== 0)
      throw new Error(`Calling game.start() when startedRounds is not 0`);

    this.active = true;

    console.log("Game started");

    this.messagingCenter.notifyGameStarted(
      this.room.id,
      this.getProcessedConfig(),
    );

    setTimeout(() => {
      void this.startNewRound();
    }, 2000);
  }

  public isPlayerOnMove(player: PlayerId): boolean {
    const currentTeam = this.teams[this.currentTeamIndex];
    const team = this.findPlayersTeam(player);

    return team === currentTeam;
  }

  public getTeamOnMove() {
    if (!this.active || !this._currentRound) return null;

    return this.teams[this.currentTeamIndex];
  }

  public isTeamOnMove(team: TeamId): boolean {
    return team === this.teams[this.currentTeamIndex].id;
  }

  public guess(guess: string, playerId: PlayerId): Result<boolean, string> {
    if (!this.active) {
      return err(`Trying to guess when game is not active`);
    }

    if (this._currentRound === null) {
      return err(`Trying to guess word while round is null`);
    }

    const guessingManager = this._currentRound.guessingManager;

    const isCorrectGuess = guessingManager.isCorrectGuess(guess);

    if (isCorrectGuess) {
      const team = this.findPlayersTeam(playerId);
      if (team === null) return err(`Can't find players team`);

      guessingManager.recordHit(team.id);

      const maxHits = this.teams.length - 1;
      if (guessingManager.hitsCount() === maxHits) {
        if (this.endRoundTimer === null)
          throw new Error(`endRoundTimer has never been set`);

        clearInterval(this.endRoundTimer);
        this.roundEnded();
      }
    }

    return ok(isCorrectGuess);
  }

  private async startNewRound() {
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;

    this._currentRound = this.roundFactory.createRound();
    await this._currentRound.start();

    this.endRoundTimer = setTimeout(() => {
      this.roundEnded();
    }, this.roundDuration);

    this.startedRounds++;
    console.log("Round started");

    const teamOnMove = this.teams[this.currentTeamIndex];

    this.messagingCenter.notifyRoundStarted(this.room.id, teamOnMove);
  }

  private roundEnded() {
    console.log("Round ended");
    if (this._currentRound === null)
      throw new Error(`Internal Error. Round is null in roundEnded handler`);

    const teamOnMove = this.teams[this.currentTeamIndex];
    this.evaluator.setTeamOnMove(teamOnMove.id);
    const report = this._currentRound.guessingManager.getReport(this.evaluator);

    this.messagingCenter.notifyRoundEnded(this.room.id, report);

    if (this.startedRounds !== this.maxRounds) {
      void this.startNewRound();
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

  // TODO
  public getProcessedConfig() {
    return {
      ...this.config,
      teams: this.teams.map((team) => {
        return {
          id: team.id,
          name: team.name,
          players: Array.from(team.players.values()),
        };
      }),
    } satisfies ProcessedGameConfig;
  }
}

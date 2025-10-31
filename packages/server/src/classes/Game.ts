import type {
  GameConfig,
  Player,
  PlayerId,
  ProcessedGameConfig,
} from "@guessthesketch/common";
import type { GameId } from "@guessthesketch/common/types/ids";
import { err, ok, type Result } from "neverthrow";
import { v4 as uuid } from "uuid";
import type { AppContext } from "./AppContext";
import { Evaluator } from "./evaluators/Evaluator";
import { SimpleEvaluator } from "./evaluators/SimpleEvaluator";
import { Leaderboard } from "./Leaderboard";
import type { MessagingCenter } from "./MessagingCenter";
import type { Room } from "./Room";
import { Round } from "./Round";
import { RoundFactory } from "./RoundFactory";
import { TeamsManager } from "./TeamsManager";

export class Game {
  public readonly id: GameId = uuid() as GameId;

  private active: boolean = false;

  private maxRounds;
  private roundDuration;

  private _currentRound: Round | null = null;
  public get currentRound() {
    return this._currentRound;
  }

  private startedRounds = 0;
  private startedRoundTimestamp: number | null = null;
  private endRoundTimer: Timer | null = null;

  private roundFactory: RoundFactory;
  private leaderboard: Leaderboard;
  public readonly teamsManager: TeamsManager;

  constructor(
    ctx: AppContext,
    private config: GameConfig,
    private room: Room,
    private messagingCenter: MessagingCenter,
    private evaluator: Evaluator = new SimpleEvaluator(),
  ) {
    this.roundFactory = new RoundFactory(config.tools, ctx);

    this.teamsManager = new TeamsManager(config.teams);
    const teams = this.teamsManager.getTeams();

    this.leaderboard = new Leaderboard(teams);

    this.maxRounds = teams.length * config.rounds.cycles;
    this.roundDuration = config.rounds.duration;
  }

  public start() {
    if (this.startedRounds !== 0)
      throw new Error(`Calling game.start() when startedRounds is not 0`);

    this.active = true;

    this.messagingCenter.notifyGameStarted(
      this.room.id,
      this.getProcessedConfig(),
    );

    this.messagingCenter.notifyLeaderboardUpdated(
      this.room.id,
      this.leaderboard.getRecord(),
    );

    setTimeout(() => {
      void this.startNewRound();
    }, 2000);
  }

  private async startNewRound() {
    this.teamsManager.cycleToNextTeam();

    const newRound = await this.roundFactory.createRound(
      this.room.id,
      this.messagingCenter,
    );

    this.startedRoundTimestamp = Date.now();

    this.endRoundTimer = setTimeout(() => {
      this.roundEnded();
    }, this.roundDuration);

    this.startedRounds++;

    const teamOnMove = this.teamsManager.getTeamOnMove();
    const guessingManager = newRound.guessingManager;

    this.messagingCenter.notifyRoundStarted(this.room.id, teamOnMove, {
      unmasked: guessingManager.getWord(false)!,
      masked: guessingManager.getWord(true)!,
    });
    this.messagingCenter.notifyRoundsCount(
      this.room.id,
      this.startedRounds,
      this.maxRounds,
    );

    this._currentRound = newRound;
  }

  private roundEnded() {
    console.log("Round ended");
    if (this._currentRound === null)
      throw new Error(`Internal Error. Round is null in roundEnded handler`);

    const teamOnMove = this.teamsManager.getTeamOnMove();

    this.evaluator.setTeamOnMove(teamOnMove.id);
    const report = this._currentRound.guessingManager.getReport(this.evaluator);
    const word = this._currentRound.guessingManager.getWord(false);

    this.leaderboard.update(report);
    this.messagingCenter.notifyLeaderboardUpdated(
      this.room.id,
      this.leaderboard.getRecord(),
    );

    this.messagingCenter.notifyRoundEnded(this.room.id, {
      word: word ?? "error",
      report,
    });

    if (this.startedRounds !== this.maxRounds) {
      setTimeout(() => {
        void this.startNewRound();
      }, 5000);
    } else {
      this._currentRound = null;
      this.gameEnded();
    }
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
      const team = this.teamsManager.findPlayersTeam(playerId);
      if (!team) return err(`Can't find players team`);

      guessingManager.recordHit(team.id);

      const maxHits = this.teamsManager.getTeamsCount() - 1;
      if (guessingManager.hitsCount() === maxHits) {
        if (this.endRoundTimer === null)
          throw new Error(`endRoundTimer has never been set`);

        clearInterval(this.endRoundTimer);
        this.roundEnded();
      }
    }

    return ok(isCorrectGuess);
  }

  private gameEnded() {
    console.log("Game end");

    this.active = false;

    setTimeout(() => {
      const teams = this.teamsManager.getTeams();
      this.messagingCenter.notifyGameEnded(
        this.room.id,
        teams.map((t) => t.id),
      );
    }, 5000);
  }

  public getLeaderboardRecord() {
    return this.leaderboard.getRecord();
  }

  public getTimeLeft() {
    if (this.currentRound === null) {
      return null;
    }

    if (this.startedRoundTimestamp === null) {
      throw new Error(`This should not happen`);
    }

    const elapsed = Date.now() - this.startedRoundTimestamp;
    const left = this.roundDuration - elapsed;

    return left;
  }

  public getRoundsCount() {
    return {
      started: this.startedRounds,
      max: this.maxRounds,
    };
  }

  // TODO
  public getProcessedConfig() {
    const teams = this.teamsManager.getTeams();
    return {
      ...this.config,
      teams: teams.map((team) => {
        return {
          id: team.id,
          name: team.name,
          players: Array.from(team.players.values()),
        };
      }),
    } satisfies ProcessedGameConfig;
  }

  public isActive() {
    return this.active;
  }

  static isValidGameConfig(
    config: GameConfig,
    players: Map<PlayerId, Player>,
  ): Result<void, string> {
    if (config.teams.length < 2) {
      return err("There must be at least 2 teams");
    }

    const processed = new Set<PlayerId>();

    for (const team of config.teams) {
      if (team.players.length == 0) {
        return err("There must be at least one player in a team");
      }

      for (const player of team.players) {
        if (!players.get(player)) {
          return err("Passed player with invalid id");
        }

        if (processed.has(player)) {
          return err("Same player assigned multiple times");
        }
        processed.add(player);
      }
    }

    if (players.size !== processed.size) {
      return err("Some players are not assigned");
    }

    return ok();
  }
}

import type { GameConfig, Player, PlayerId } from "@guessthesketch/common";
import { v4 as uuid } from "uuid";
import { Game } from "./Game";
import type { MessagingCenter } from "./MessagingCenter";
import type { AppContext } from "./AppContext";
import { err, ok, type Result } from "neverthrow";

export class Room {
  private _currentGame: Game | null = null;
  public get currentGame() {
    return this._currentGame;
  }

  private players: Map<PlayerId, Player> = new Map();

  constructor(
    private ctx: AppContext,
    public ownerId: PlayerId,
    public id: string = uuid(),
  ) {}

  public startGame(
    config: GameConfig,
    messagingCenter: MessagingCenter,
  ): Result<void, string> {
    if (this._currentGame) {
      return err(`Game already started`);
    }

    const checkResult = this.isValidGameConfig(config);

    if (checkResult.isErr()) {
      console.error(checkResult.error);
      return checkResult;
    }

    console.log("About to start the game");

    this._currentGame = new Game(this.ctx, config, this, messagingCenter);
    this._currentGame.start();

    return ok();
  }

  public addPlayer(playerId: PlayerId, playerName: string) {
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
    });
  }

  public removePlayer(playerId: PlayerId) {
    this.players.delete(playerId);
  }

  public getAllPlayers() {
    return this.players.values().toArray();
  }

  private isValidGameConfig(config: GameConfig): Result<void, string> {
    if (config.teams.length < 2) {
      return err("There must be at least 2 teams");
    }

    const processed = new Set<PlayerId>();

    for (const team of config.teams) {
      if (team.players.length == 0) {
        return err("There must be at least one player in a team");
      }

      for (const player of team.players) {
        if (!this.players.get(player)) {
          return err("Passed player with invalid id");
        }

        if (processed.has(player)) {
          return err("Same player assigned multiple times");
        }
        processed.add(player);
      }
    }

    if (this.players.size !== processed.size) {
      return err("Some players are not assigned");
    }

    return ok();
  }
}

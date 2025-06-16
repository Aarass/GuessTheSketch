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

    if (!this.isValidGameConfig(config)) {
      return err(`Bad config`);
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

  // TODO
  private isValidGameConfig(_config: GameConfig): boolean {
    return true;
  }
}

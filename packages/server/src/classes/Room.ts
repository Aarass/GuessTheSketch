import type {
  GameConfig,
  Player,
  PlayerId,
  RoomId,
} from "@guessthesketch/common";
import { v4 as uuid } from "uuid";
import { Game } from "./Game";
import type { MessagingCenter } from "./MessagingCenter";
import type { AppContext } from "./AppContext";
import { err, ok, type Result } from "neverthrow";

export class Room {
  public readonly id: RoomId = uuid() as RoomId;

  private _currentGame: Game | null = null;
  public get currentGame() {
    return this._currentGame;
  }

  private players: Map<PlayerId, Player> = new Map();

  constructor(public ownerId: PlayerId) {}

  public startGame(
    config: GameConfig,
    ctx: AppContext,
    messagingCenter: MessagingCenter,
  ): Result<void, string> {
    if (this._currentGame?.isActive()) {
      return err(`Game already started`);
    }

    const checkResult = Game.isValidGameConfig(config, this.players);

    if (checkResult.isErr()) {
      console.error(checkResult.error);
      return checkResult;
    }

    this._currentGame = new Game(ctx, config, this, messagingCenter);
    this._currentGame.start();

    return ok();
  }

  public addPlayer(playerId: PlayerId, playerName: string) {
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
    });
  }

  public removePlayer(
    playerId: PlayerId,
  ): Result<[Player, Player | null], string> {
    const player = this.players.get(playerId);

    if (!player) {
      return err(`Can't find player with passed id`);
    }

    this.players.delete(playerId);

    if (this.ownerId === player.id) {
      const newOwner = this.tryFindNewOwner();

      if (newOwner) {
        this.ownerId = newOwner.id;
        return ok([player, newOwner]);
      }
    }

    return ok([player, null]);
  }

  public getAllPlayers() {
    return this.players.values().toArray();
  }

  public getPlayersCount() {
    return this.players.size;
  }

  private tryFindNewOwner() {
    return this.players.values().next().value;
  }
}

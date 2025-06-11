import type { GameConfig, PlayerId } from "@guessthesketch/common";
import { v4 as uuid } from "uuid";
import { Game } from "./Game";
import type { MessagingCenter } from "./MessagingCenter";
import type { Player } from "./Player";

export class Room {
  private _currentGame: Game | null = null;
  public get currentGame() {
    return this._currentGame;
  }

  private players: Map<PlayerId, Player> = new Map();
  // TODO

  constructor(
    public ownerId: PlayerId,
    public id: string = uuid(),
  ) {}

  startGame(config: GameConfig, messagingCenter: MessagingCenter) {
    // TODO should these throw?
    if (this._currentGame) throw `Game already started`;
    if (!this.isValidGameConfig(config)) throw `Bad config`;

    console.log("About to start the game");

    this._currentGame = new Game(config, this, messagingCenter);
    this._currentGame.start();
  }

  addPlayer(playerId: PlayerId, playerName: string) {
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
    });
  }

  removePlayer(playerId: PlayerId) {
    this.players.delete(playerId);
  }

  getAllPlayers() {
    return this.players.values().toArray();
  }

  // TODO
  private isValidGameConfig(config: GameConfig): boolean {
    return true;
  }
}

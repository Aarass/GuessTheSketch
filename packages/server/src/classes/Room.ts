import type { GameConfig, PlayerId } from "@guessthesketch/common";
import type { Player } from "./Player";
import { Game } from "./Game";

export class Room {
  public currentGame: Game | null = null;
  private players: Map<PlayerId, Player> = new Map();

  constructor(
    public id: string,
    public ownerId: PlayerId
  ) {
    console.log("Room created");
  }

  startGame(config: GameConfig) {
    if (this.currentGame) throw `Game already started`;
    if (!this.isValidGameConfig(config)) throw `Bad config`;

    console.log("About to start the game");

    this.currentGame = new Game(config, this);
    this.currentGame.onEnd = () => {
      console.log("Game end from room");
    };
    this.currentGame.start();
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

  private isValidGameConfig(config: GameConfig): boolean {
    // TODO
    return true;
    throw `Not Implemented Yet!`;
  }
}

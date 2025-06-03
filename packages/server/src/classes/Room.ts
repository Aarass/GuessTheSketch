import type { GameConfig, PlayerId } from "@guessthesketch/common";
import { v4 as uuid } from "uuid";
import type { MyNamespaces } from "..";
import { Game } from "./Game";
import type { Player } from "./Player";

export class Room {
  public currentGame: Game | null = null;
  private players: Map<PlayerId, Player> = new Map();
  private namespaces: MyNamespaces | undefined;

  constructor(
    public ownerId: PlayerId,
    public id: string = uuid(),
  ) {}

  startGame(config: GameConfig, namespaces: MyNamespaces) {
    if (this.currentGame) throw `Game already started`;
    if (!this.isValidGameConfig(config)) throw `Bad config`;

    console.log("About to start the game");

    this.namespaces = namespaces;

    this.currentGame = new Game(config, this);
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

  emitToGlobal: MyNamespaces["globalNamespace"]["emit"] = (...args) => {
    if (this.namespaces) {
      return this.namespaces.globalNamespace.to(this.id).emit(...args);
    } else {
      console.error(`namespaces is ${this.namespaces}`);
      return false;
    }
  };

  emitToControls: MyNamespaces["controlsNamespace"]["emit"] = (...args) => {
    if (this.namespaces) {
      return this.namespaces.controlsNamespace.to(this.id).emit(...args);
    } else {
      console.error(`namespaces is ${this.namespaces}`);
      return false;
    }
  };

  emitToDrawings: MyNamespaces["drawingsNamespace"]["emit"] = (...args) => {
    if (this.namespaces) {
      return this.namespaces.drawingsNamespace.to(this.id).emit(...args);
    } else {
      console.error(`namespaces is ${this.namespaces}`);
      return false;
    }
  };

  emitToChat: MyNamespaces["chatNamespace"]["emit"] = (...args) => {
    if (this.namespaces) {
      return this.namespaces.chatNamespace.to(this.id).emit(...args);
    } else {
      console.error(`namespaces is ${this.namespaces}`);
      return false;
    }
  };

  private isValidGameConfig(config: GameConfig): boolean {
    // TODO
    return true;
  }
}

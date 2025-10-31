import {
  GameConfigSchema,
  type GameConfig,
  type GlobalNamespace as GlobalNamespaceType,
  type LeaderboardRecord,
  type Player,
  type PlayerId,
  type ProcessedGameConfig,
  type RoomId,
  type RoundReportWithWord,
  type TeamId,
} from "@guessthesketch/common";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import type { Room } from "../Room";
import { NamespaceClass } from "./Base";

export class GlobalNamespace extends NamespaceClass<GlobalNamespaceType> {
  registerHandlers(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ) {
    this.onConnectionHandler(socket).catch(console.error);

    socket.on("ready", this.getOnReadyHandler(socket));
    socket.on("start game", this.getOnStartGameHandler(socket));
    socket.on("disconnect", this.getOnDisconnectHandler(socket));
  }

  public notifyRoundStarted(room: RoomId, teamOnMoveId: TeamId) {
    this.namespace.to(room).emit("round started", teamOnMoveId);
  }

  public notifyRoundsCount(
    room: RoomId,
    startedRounds: number,
    maxRounds: number,
  ) {
    this.namespace.to(room).emit("rounds count", startedRounds, maxRounds);
  }

  public notifyRoundEnded(room: RoomId, report: RoundReportWithWord) {
    this.namespace.to(room).emit("round ended", report);
  }

  public notifyLeaderboardUpdated(
    room: RoomId,
    leaderboard: LeaderboardRecord,
  ) {
    this.namespace.to(room).emit("leaderboard", leaderboard);
  }

  public notifyGameStarted(room: RoomId, config: ProcessedGameConfig) {
    this.namespace.to(room).emit("game started", config);
  }

  public notifyGameEnded(room: RoomId) {
    this.namespace.to(room).emit("game ended");
  }

  public notifyNewOwner(room: RoomId, newOwner: Player) {
    this.namespace.to(room).emit("new owner", newOwner.id);
  }

  public notifyPlayerLeft(room: Room, playerId: PlayerId) {
    this.namespace.to(room.id).emit("player left room", playerId);
  }

  private async onConnectionHandler(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ) {
    await this.runWithContextUpToRoom(socket, async (userId, room) => {
      const user = await this.ctx.userService.getUserById(userId);

      if (user === null) {
        socket.disconnect();
        console.error("User doesn't exist");
        return;
      }

      socket.to(room.id).emit("player joined room", {
        id: userId,
        name: user.username,
      });
    });

    // // Ovde hendlam stvari ako je gejm vec u toku
    // runWithContextUpToGame(socket, (_playerId, _room, game) => {
    //   socket.emit("game config", game.getProcessedConfig());
    // });
  }

  private getOnReadyHandler(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ) {
    return async () => {
      this.runWithContextUpToRoom(socket, (_, room) => {
        const allPlayers = room.getAllPlayers();
        socket.emit("sync players", allPlayers);
      });
    };
  }

  private getOnStartGameHandler(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ): (config: GameConfig) => void {
    return (_config: GameConfig) => {
      this.runWithContextUpToRoom(socket, (userId, room) => {
        if (room.ownerId !== userId) {
          console.log(`You are not the owner of the room`);
          return;
        }

        const parseResult = GameConfigSchema.safeParse(_config);

        if (parseResult.success) {
          const config = parseResult.data;
          const res = room.startGame(config, this.ctx, this.messagingCenter);

          if (res.isErr()) {
            socket.emit("game not started", res.error);
          }
        }
      });
    };
  }

  private getOnDisconnectHandler(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ) {
    return () => {
      this.runWithContextUpToRoom(socket, (userId, room) => {
        const result = room.removePlayer(userId);

        if (result.isOk()) {
          const [removedPlayer, newOwner] = result.value;

          this.notifyPlayerLeft(room, removedPlayer.id);
          if (newOwner) {
            this.notifyNewOwner(room.id, newOwner);
          }
        }

        if (room.getPlayersCount() === 0) {
          this.ctx.roomsService.removeRoom(room.id);
        }
      });
    };
  }
}

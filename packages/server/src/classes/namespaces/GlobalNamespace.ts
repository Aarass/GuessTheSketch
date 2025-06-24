import {
  GameConfigSchema,
  type GameConfig,
  type GlobalNamespace as GlobalNamespaceType,
  type Leaderboard,
  type Player,
  type PlayerId,
  type ProcessedGameConfig,
  type RoomId,
  type RoundReport,
  type TeamId,
} from "@guessthesketch/common";
import {
  runWithContextUpToGame,
  runWithContextUpToRoom,
} from "../../utility/extractor";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import type { Room } from "../Room";
import { GlobalState } from "../states/GlobalState";
import { NamespaceClass } from "./Base";

export class GlobalNamespace extends NamespaceClass<GlobalNamespaceType> {
  registerHandlers(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ) {
    this.onConnectionHandler(socket).catch(console.error);

    socket.on("ready", this.getOnReadyHandler(socket));
    socket.on("restore", this.getOnRestoreHandler(socket));
    socket.on("start game", this.getOnStartGameHandler(socket));
    socket.on("disconnect", this.getOnDisconnectHandler(socket));
  }

  public notifyRoundStarted(room: RoomId, teamOnMoveId: TeamId) {
    this.namespace.to(room).emit("round started", teamOnMoveId);
  }

  public notifyRoundEnded(room: RoomId, report: RoundReport) {
    this.namespace.to(room).emit("round ended", report);
  }

  public notifyLeaderboardUpdated(room: RoomId, leaderboard: Leaderboard) {
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
    await runWithContextUpToRoom(socket, async (userId, room) => {
      const user = await this.ctx.userService.getUserById(userId);

      if (user === null) {
        socket.disconnect();
        console.error("User doesn't exist");
        return;
      }

      room.addPlayer(userId, user.username);

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
      runWithContextUpToRoom(socket, (_, room) => {
        const allPlayers = room.getAllPlayers();
        socket.emit("sync players", allPlayers);
      });
    };
  }

  private getOnRestoreHandler(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ) {
    return async (
      callback: (payload: {
        config: ProcessedGameConfig;
        teamOnMove: TeamId | null;
      }) => void,
    ) => {
      console.warn(`=========== In Restore ===========`);

      runWithContextUpToGame(socket, (_, _room, game) => {
        const config = game.getProcessedConfig();
        const teamOnMove = game.getTeamOnMove();

        callback({ config, teamOnMove: teamOnMove?.id ?? null });
      });
    };
  }

  private getOnStartGameHandler(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ): (config: GameConfig) => void {
    return (_config: GameConfig) => {
      runWithContextUpToRoom(socket, (userId, room) => {
        if (room.ownerId !== userId) {
          console.log(`You are not the owner of the room`);
          return;
        }

        const parseResult = GameConfigSchema.safeParse(_config);

        if (parseResult.success) {
          const config = parseResult.data;
          const res = room.startGame(config, this.messagingCenter);

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
      runWithContextUpToRoom(socket, (userId, room) => {
        const result = room.removePlayer(userId);

        if (result.isOk()) {
          const [removedPlayer, newOwner] = result.value;

          this.notifyPlayerLeft(room, removedPlayer.id);
          if (newOwner) {
            this.notifyNewOwner(room.id, newOwner);
          }
        }

        if (room.getPlayersCount() === 0) {
          GlobalState.getInstance().removeRoom(room.id);
        }
      });
    };
  }
}

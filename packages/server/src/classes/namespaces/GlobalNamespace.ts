import type {
  GameConfig,
  GlobalNamespace as GlobalNamespaceType,
  Player,
  ProcessedGameConfig,
  RoomId,
} from "@guessthesketch/common";
import userService from "../../services/userService";
import { runWithContextUpToRoom } from "../../utility/extractor";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import { NamespaceClass } from "./Base";

export class GlobalNamespace extends NamespaceClass<GlobalNamespaceType> {
  async registerHandlers(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ) {
    socket.on("ready", this.getOnReadyHandler(socket));
    socket.on("disconnect", this.getOnDisconnectHandler(socket));
    socket.on("start game", this.getOnStartGameHandler(socket));
  }

  public notifyGameStarted(room: RoomId, config: ProcessedGameConfig) {
    this.namespace.to(room).emit("game started", config);
  }

  public notifyGameEnded(room: string) {
    this.namespace.to(room).emit("game ended");
  }

  private getOnReadyHandler(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ) {
    return async () => {
      await runWithContextUpToRoom(socket, async (userId, room) => {
        const user = await userService.getUserById(userId);

        if (user === null) {
          socket.disconnect();
          console.error("User doesn't exist");
          return;
        }

        room.addPlayer(userId, user.username);

        const allPlayers = room.getAllPlayers();
        const player: Player = {
          id: userId,
          name: user.username,
        };

        socket.emit("sync players", allPlayers);
        socket.join(room.id);
        socket.to(room.id).emit("player joined room", player);
      });
    };
  }

  private getOnDisconnectHandler(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ) {
    return () => {
      runWithContextUpToRoom(socket, (userId, room) => {
        room.removePlayer(userId);

        socket.to(room.id).emit("player left room", userId);

        (socket.request.session.roomId as any) = null;
        socket.request.session.save();
      });
    };
  }

  private getOnStartGameHandler(
    socket: GuardedSocket<ExtractSocketType<GlobalNamespaceType>>,
  ): (config: GameConfig) => void {
    return (config: GameConfig) => {
      runWithContextUpToRoom(socket, (userId, room) => {
        if (room === null) {
          return console.log(`Can't find room`);
        }

        if (room.ownerId !== userId) {
          return console.log(`You are not the owner of the room`);
        }

        // TODO validate config

        room.startGame(config, this.messagingCenter);
      });
    };
  }
}

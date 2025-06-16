import {
  GameConfigSchema,
  type GameConfig,
  type GlobalNamespace as GlobalNamespaceType,
  type Player,
  type ProcessedGameConfig,
  type RoomId,
} from "@guessthesketch/common";
import { runWithContextUpToRoom } from "../../utility/extractor";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import { NamespaceClass } from "./Base";

export class GlobalNamespace extends NamespaceClass<GlobalNamespaceType> {
  registerHandlers(
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
        const user = await this.ctx.userService.getUserById(userId);

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

        (socket.request.session.roomId as any) = null; // eslint-disable-line @typescript-eslint/no-explicit-any
        socket.request.session.save();
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
          // TODO ako je error poslati nazad obavestenje
          // mozes da koristis socket umesto namespace kad saljes
          // da bi poslao samo onome ko je inicirao startovanje
          const res = room.startGame(config, this.messagingCenter);

          if (res.isErr()) {
            socket.emit("game not started", res.error);
          }
        }
      });
    };
  }
}

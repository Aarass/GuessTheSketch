import type {
  ChatMessage,
  ChatNamespace as ChatNamespaceType,
  ProcessedGameConfig,
  RoomId,
  Team,
} from "@guessthesketch/common";
import {
  runWithContextUpToRoom,
  runWithContextUpToRound,
} from "../../utility/extractor";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import { NamespaceClass } from "./Base";

export class ChatNamespace extends NamespaceClass<ChatNamespaceType> {
  async registerHandlers(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    socket.join(socket.request.session.roomId);

    // socket.on("ready", this.getOnReadyHandler(socket));
    socket.on("join-team", this.getOnJoinTeamHandler(socket));
    socket.on("join-drawing-room", this.getOnJoinDrawingRoomHandler(socket));
    socket.on("leave-drawing-room", this.getOnLeaveDrawingRoomHandler(socket));
    socket.on("chat message", this.getOnChatMessageHandler(socket));
  }

  private getOnJoinTeamHandler(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    return (team: string) => {
      runWithContextUpToRoom(socket, (_userId, room) => {
        console.log(`CHAT: JOIN-TEAM`);
        socket.join(`${team}-${room.id}`);
      });
    };
  }

  private getOnJoinDrawingRoomHandler(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    return () => {
      runWithContextUpToRoom(socket, (userId, room) => {
        socket.join(`drawing-${room.id}`);
        console.log(`Igrac-${userId} je uso u sobu za crtanje`);
      });
    };
  }

  private getOnLeaveDrawingRoomHandler(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    return () => {
      runWithContextUpToRoom(socket, (_userId, room) => {
        socket.leave(`drawing-${room.id}`);
        console.log(`CHAT: NAPUSTIO SOBU ZA CRTANJE`);
      });
    };
  }

  private getOnChatMessageHandler(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    return (message: string) => {
      runWithContextUpToRound(socket, (userId, room, game, round) => {
        console.log(`CHAT: STIGLA PORUKA`);

        const playerTeam = game.findPlayersTeam(userId);
        if (!playerTeam) return;

        const isCorrectGuess = round.isCorrectGuess(message);

        const isPlayerInDrawingRoom = room
          // TODO sakri detalje implementacije.
          .getPlayersInDrawingRoom()
          .has(userId);

        if (isCorrectGuess && !isPlayerInDrawingRoom) {
          playerTeam.players.forEach((player) => {
            room.addPlayerToDrawingRoom(player);
            console.log(`${player}`);
          });

          game.guess(message, userId);
          socket.join(`drawing-${room.id}`);
          socket.to(`${playerTeam.name}-${room.id}`).emit("join-drawing-room");
          console.log(`Igrac-${userId} je uso u sobu za crtanje`);
          return;
        }

        // TODO prebaci u common
        const newMessage: ChatMessage = {
          user: userId,
          message: message,
        };

        if (isPlayerInDrawingRoom) {
          this.notifyMessage(`drawing-${room.id}`, newMessage);

          room.getPlayersInDrawingRoom().forEach((element) => {
            console.log(`${element}`);
          });
        } else {
          this.notifyMessage(room.id, newMessage);
        }
      });
    };
  }

  public notifyGameStarted(room: RoomId, config: ProcessedGameConfig) {
    this.namespace.to(room).emit("start game", config);
  }

  public notifyRoundStarted(room: RoomId, teamOnMove: Team) {
    this.namespace.to(room).emit("round-started", teamOnMove.name);
  }

  public notifyRoundEnded(room: RoomId) {
    this.namespace.to(room).emit("round-ended");
  }

  public notifyMessage(room: RoomId, message: ChatMessage) {
    this.namespace.to(`drawing-${room}`).emit("chat message", message);
  }

  // private getOnReadyHandler(
  //   socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  // ) {
  //   return () => {
  //     runWithContextUpToRound(socket, (userId, room, game, _round) => {
  //       const config = game.getGameConfig();
  //
  //       if (config) {
  //         namespaces.chatNamespace.to(socket.id).emit("start game", config);
  //         console.log(`Saljem GAME CONFIG za : ${socket.id}`);
  //       } else {
  //         socket.to(socket.id).emit("game-config-not-set");
  //         console.log("GAME CONFIG jos nije psotavljen");
  //       }
  //     });
  //   };
  // }
}

import type {
  ChatMessage,
  ChatNamespace as ChatNamespaceType,
  PlayerId,
  ProcessedGameConfig,
  RoomId,
  Team,
  TeamId,
} from "@guessthesketch/common";
import {
  runWithContextUpToGame,
  runWithContextUpToRound,
} from "../../utility/extractor";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import { NamespaceClass } from "./Base";

export class ChatNamespace extends NamespaceClass<ChatNamespaceType> {
  registerHandlers(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    socket.join(socket.request.session.roomId);
    this.setupAuxiliaryRooms(socket);

    socket.on("message", this.getOnChatMessageHandler(socket));
  }

  private setupAuxiliaryRooms(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    this.addPlayerToPlayerRoom(socket);

    runWithContextUpToGame(socket, (userId, room, game) => {
      const team = game.findPlayersTeam(userId);

      if (team) {
        this.addPlayerToTeamRoom(room.id, userId, team.id);
      }
    });
  }

  public notifyGameStarted(room: RoomId, config: ProcessedGameConfig) {
    // TODO treba da se proveri da li je ovo obavezno.
    // Trenutno, game se stratuje pre nego sto bilo ko stigne da se poveze,
    // pa ovo onda nema kog da ubaci u timske sobe.
    // Zato ovo radim posebno za svakog igraca na onConnect tj. u registerHandlers.
    // Ipak, mislim da postoji minimalna sansa da ovo bude korisno:
    // Ako se pokrene novi game u istoj sobi, a konekcije onstanu zive, onConnect se nece desiti,
    // pa ce onda ovo ovde imati posla. Dakle, sve zavisi od implementacije na frontendu. Ipak,
    // najbolje je da pokrijemo sve slucajeve i ne oslanjamo se na frontend.
    //// ----------------------------------
    /**/ this.setupTeamRooms(room, config);
    //// ----------------------------------

    // this.namespace.to(room).emit("start game", config);
  }

  public notifyGameEnded(room: string, teamIds: TeamId[]) {
    this.clearTeamRooms(room, teamIds);
  }

  public notifyRoundStarted(room: RoomId, teamOnMove: Team) {
    this.clearUnrestrictedRoom(room);
    this.addTeamToUnrestrictedRoom(room, teamOnMove.id);

    // this.namespace.to(room).emit("round-started", teamOnMove.name);
  }

  public notifyRoundEnded(room: RoomId) {
    // this.namespace.to(room).emit("round-ended");
  }

  // public notifyMessage(room: RoomId, message: ChatMessage) {
  //   this.namespace.to(`drawing-${room}`).emit("chat message", message);
  // }

  private getOnChatMessageHandler(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    return (message: string) => {
      console.log("primio msg", message);
      runWithContextUpToRound(socket, (userId, room, game, round) => {
        const newMessage: ChatMessage = {
          user: userId,
          message: message,
        };

        const playersTeam = game.findPlayersTeam(userId);
        if (!playersTeam) return;

        const isOnMove = game.isTeamOnMove(playersTeam.id);
        const alreadyGuessed = round.guessingManager.hasTeamGuessedWord(
          playersTeam.id,
        );

        if (isOnMove || alreadyGuessed) {
          this.sendUnrestrictedMessage(room.id, newMessage);
          console.log("sending to unrestricted");
        } else {
          const isCorrectGuess = game.guess(message, userId);

          if (isCorrectGuess) {
            console.log("correct");
            this.addTeamToUnrestrictedRoom(room.id, playersTeam.id);

            this.messagingCenter.notifyPlayerGuessedCorrectly();
          } else {
            console.log("sending safe");
            this.sendSafeMessage(room.id, newMessage);
          }
        }
      });
    };
  }

  private sendUnrestrictedMessage(roomId: RoomId, message: ChatMessage) {
    this.namespace
      .to(this.getUnrestrictedRoomName(roomId))
      .emit("message", message);
  }

  private sendSafeMessage(roomId: RoomId, message: ChatMessage) {
    this.namespace.to(roomId).emit("message", message);
  }

  private addTeamToUnrestrictedRoom(roomId: RoomId, teamId: TeamId) {
    this.namespace
      .in(this.getTeamRoomName(roomId, teamId))
      .socketsJoin(this.getUnrestrictedRoomName(roomId));
  }

  private clearUnrestrictedRoom(roomId: RoomId) {
    const room = this.getUnrestrictedRoomName(roomId);
    this.namespace.in(room).socketsLeave(room);
  }

  // TODO obraditi reconnect. Jedna ideja je da u registerHandlers proveris da li je game active,
  // pa rucno ubacis igraca u teamRoom. To je pod pretpostavkom da ovu metodu zove Game (preko MessagingCenter)
  private setupTeamRooms(roomId: RoomId, config: ProcessedGameConfig) {
    for (const teamConfig of config.teams) {
      for (const playerId of teamConfig.players) {
        this.addPlayerToTeamRoom(roomId, playerId, teamConfig.id);
      }
    }
  }

  private clearTeamRooms(roomId: RoomId, teamIds: TeamId[]) {
    for (const teamId of teamIds) {
      const room = this.getTeamRoomName(roomId, teamId);
      this.namespace.in(room).socketsLeave(room);
    }
  }

  private addPlayerToPlayerRoom(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    socket.join(this.getPlayerRoomName(socket.request.session.userId));
  }

  private addPlayerToTeamRoom(
    roomId: RoomId,
    playerId: PlayerId,
    teamId: TeamId,
  ) {
    this.namespace
      .in(this.getPlayerRoomName(playerId))
      .socketsJoin(this.getTeamRoomName(roomId, teamId));
  }

  private getPlayerRoomName(playerId: PlayerId) {
    return `user:${playerId}`;
  }

  private getTeamRoomName(roomId: RoomId, teamId: TeamId) {
    return `${roomId}-team:${teamId}`;
  }

  private getUnrestrictedRoomName(roomId: RoomId) {
    return `${roomId}-unrestricted`;
  }

  // socket.on("ready", this.getOnReadyHandler(socket));

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

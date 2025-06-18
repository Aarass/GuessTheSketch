import type {
  Drawing,
  ProcessedGameConfig,
  RoomId,
  RoundReport,
  Team,
  TeamId,
} from "@guessthesketch/common";
import { Server as SocketIOServer } from "socket.io";
import type { AppContext } from "./AppContext";
import { ChatNamespace } from "./namespaces/ChatNamespace";
import { ControlsNamespace } from "./namespaces/ControlsNamespace";
import { DrawingsNamespace } from "./namespaces/DrawingNamespace";
import { GlobalNamespace } from "./namespaces/GlobalNamespace";

// TODO

// import amqp from "amqplib";
// import { drawingsQueueName } from "@guessthesketch/common";

// const url = process.env.AMQPURL ?? "amqp://localhost";
//
// const connection = await amqp.connect(url);
// const channel = await connection.createChannel();
// const { queue: drawingsQueue } = await channel.assertQueue(drawingsQueueName);

// ----------------
// --- Mediator ---
// ----------------
export class MessagingCenter {
  private namespaces;

  constructor(server: SocketIOServer, ctx: AppContext) {
    this.namespaces = {
      global: new GlobalNamespace("", server, this, ctx),
      drawings: new DrawingsNamespace("drawings", server, this, ctx),
      controls: new ControlsNamespace("controls", server, this, ctx),
      chat: new ChatNamespace("chat", server, this, ctx),
    };
  }

  notifyPlayerGuessedCorrectly() {
    //TODO
    console.log("Method not implemented.");
  }

  public notifyGameStarted(room: RoomId, config: ProcessedGameConfig) {
    this.namespaces.global.notifyGameStarted(room, config);
    this.namespaces.chat.notifyGameStarted(room, config);
  }

  public notifyGameEnded(room: RoomId, teamIds: TeamId[]) {
    this.namespaces.global.notifyGameEnded(room);
    this.namespaces.chat.notifyGameEnded(room, teamIds);
  }

  public notifyRoundStarted(room: RoomId, teamOnMove: Team) {
    this.namespaces.global.notifyRoundStarted(room, teamOnMove.id);
    this.namespaces.chat.notifyRoundStarted(room, teamOnMove);
  }

  public notifyRoundEnded(room: RoomId, report: RoundReport) {
    this.namespaces.global.notifyRoundEnded(room, report);
    this.namespaces.chat.notifyRoundEnded(room);
  }

  public notifyNewDrawing(room: RoomId, drawing: Drawing) {
    this.namespaces.drawings.notifyNewDrawing(room, drawing);
  }
}

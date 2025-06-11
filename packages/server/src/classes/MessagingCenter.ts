import { Server as SocketIOServer } from "socket.io";
import { ChatNamespace } from "./namespaces/ChatNamespace";
import { ControlsNamespace } from "./namespaces/ControlsNamespace";
import { DrawingsNamespace } from "./namespaces/DrawingNamespace";
import { GlobalNamespace } from "./namespaces/GlobalNamespace";
import type {
  BroadcastMessage,
  ProcessedGameConfig,
  RoomId,
  RoundReport,
  TeamId,
} from "@guessthesketch/common";
import type { AppContext } from "./AppContext";

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

  public notifyGameStarted(room: RoomId, config: ProcessedGameConfig) {
    this.namespaces.global.notifyGameStarted(room, config);
  }

  public notifyGameEnded(room: RoomId) {
    this.namespaces.global.notifyGameEnded(room);
  }

  public notifyRoundStarted(room: RoomId, teamOnMoveId: TeamId) {
    this.namespaces.controls.notifyRoundStarted(room, teamOnMoveId);
  }

  public notifyRoundEnded(room: RoomId, report: RoundReport) {
    this.namespaces.controls.notifyRoundEnded(room, report);
  }

  public notifyNewDrawing(room: RoomId, bm: BroadcastMessage) {
    this.namespaces.drawings.notifyNewDrawing(room, bm);
  }
}

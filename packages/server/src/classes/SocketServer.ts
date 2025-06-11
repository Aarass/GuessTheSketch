import type { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { corsOptions } from "../middlewares/cors";
import sessionMiddleware from "../middlewares/session";
import { MessagingCenter } from "./MessagingCenter";

export class SocketServer {
  private server;
  private messagingCenter;

  constructor(rawServer: Server) {
    this.server = new SocketIOServer(rawServer, { cors: corsOptions });
    this.server.engine.use(sessionMiddleware);

    this.messagingCenter = new MessagingCenter(this.server);
  }
}

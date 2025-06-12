import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import corsMiddleware, { corsOptions } from "../middlewares/cors";
import { authenticate as expressAuth } from "../middlewares/express/authenticate";
import sessionMiddleware from "../middlewares/session";
import { AppContext } from "./AppContext";
import { MessagingCenter } from "./MessagingCenter";
import { AuthController } from "./controllers/AuthController";
import { RoomsController } from "./controllers/RoomsController";
import { WordsController } from "./controllers/WordsController";

export class App {
  private rawServer = createServer();

  constructor(private ctx: AppContext) {
    this.bootstrapHttpServer();
    this.bootstrapSocketServer();
  }

  public run() {
    this.rawServer.listen(8080, "0.0.0.0", () => {
      console.log("server started on: ", this.rawServer.address());
    });
  }

  private bootstrapHttpServer() {
    const server = express();

    server.use(express.json());
    server.use(corsMiddleware);
    server.use(sessionMiddleware);

    [
      new AuthController(this.ctx),
      new RoomsController(this.ctx),
      new WordsController(this.ctx),
    ].forEach((controller) => {
      server.use(controller.getHandlers());
    });

    server.get("/", expressAuth, (_, res) => {
      res.sendStatus(200);
    });

    this.rawServer.addListener("request", server);
  }

  private bootstrapSocketServer() {
    const server = new SocketIOServer(this.rawServer, { cors: corsOptions });
    server.engine.use(sessionMiddleware);

    new MessagingCenter(server, this.ctx);
  }
}

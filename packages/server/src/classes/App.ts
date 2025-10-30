import express from "express";
import type { RequestListener } from "http";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import corsMiddleware, { corsOptions } from "../middlewares/cors";
import sessionMiddleware from "../middlewares/session";
import { AppContext } from "./AppContext";
import { MessagingCenter } from "./MessagingCenter";
import type { Controller } from "./controllers/Controller";

export class App {
  private rawServer = createServer();

  constructor(ctx: AppContext, controllers: Controller[]) {
    this.bootstrapHttpServer(controllers);
    this.bootstrapSocketServer(ctx);
  }

  public run() {
    this.rawServer.listen(8080, "0.0.0.0", () => {
      console.log("Server started on: ", this.rawServer.address());
    });
  }

  private bootstrapHttpServer(controllers: Controller[]) {
    const server = express();

    server.use(express.json());
    server.use(corsMiddleware);
    server.use(sessionMiddleware);

    controllers.forEach((controller) => {
      server.use(controller.getRouter());
    });

    this.rawServer.addListener("request", server as RequestListener);
  }

  private bootstrapSocketServer(ctx: AppContext) {
    const server = new SocketIOServer(this.rawServer, { cors: corsOptions });
    server.engine.use(sessionMiddleware);

    new MessagingCenter(server, ctx);
  }
}

import express from "express";
import type { Server } from "http";
import authController from "../controllers/authController";
import roomsController from "../controllers/roomsController";
import corsMiddleware from "../middlewares/cors";
import { authenticate as expressAuth } from "../middlewares/express/authenticate";
import sessionMiddleware from "../middlewares/session";

export class HttpServer {
  private server;

  constructor(rawServer: Server) {
    this.server = express();
    rawServer.addListener("request", this.server);

    this.server.use(express.json());
    this.server.use(corsMiddleware);
    this.server.use(sessionMiddleware);

    this.server.use(authController);
    this.server.use(roomsController);

    this.server.get("/", expressAuth, (_, res) => {
      res.sendStatus(200);
    });
  }
}

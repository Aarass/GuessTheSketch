import type {
  ChatSocket,
  ControlsNamespace,
  DrawingsNamespace,
  GlobalNamespace,
} from "@guessthesketch/common";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import sessionMiddleware from "./middlewares/session";
import corsMiddleware, { corsOptions } from "./middlewares/cors";
import { authenticate as expressAuth } from "./middlewares/express/authenticate";
import authController from "./controllers/authController";
import roomsController from "./controllers/roomsController";
import { registerHandlersForControls } from "./namespaces/controls/controls";
import { registerHandlersForChat } from "./namespaces/chat/chat";
import { registerHandlersForGlobal } from "./namespaces/global/global";
import type { ChatNamespace } from "@guessthesketch/common";
import { guarded, type GuardedSocket } from "./utility/guarding";
import { registerHandlersForDrawings } from "./namespaces/drawings/drawings";

const app = express();
app.use(express.json());
app.use(corsMiddleware);
app.use(sessionMiddleware);

app.use(authController);
app.use(roomsController);
app.get("/", expressAuth, (_, res) => {
  res.sendStatus(200);
});

const server = createServer(app);

const io = new Server(server, { cors: corsOptions });
io.engine.use(sessionMiddleware);

const ios = {
  globalNamespace: io.of("/") as GlobalNamespace,
  drawingsNamespace: io.of("/drawings") as DrawingsNamespace,
  controlsNamespace: io.of("/controls") as ControlsNamespace,
  chatNamespace: io.of("/chat") as ChatNamespace,
};

export type MyNamespaces = typeof ios;

guarded(ios.globalNamespace).on("connection", (socket) => {
  registerHandlersForGlobal(ios, socket as GuardedSocket<typeof socket>);
});

guarded(ios.drawingsNamespace).on("connection", (socket) => {
  registerHandlersForDrawings(ios, socket as GuardedSocket<typeof socket>);
});

guarded(ios.controlsNamespace).on("connection", (_socket) => {
  registerHandlersForControls(ios, _socket as GuardedSocket<typeof _socket>);
});

guarded(ios.chatNamespace).on("connection", (_socket: ChatSocket) => {
  registerHandlersForChat(ios, _socket as GuardedSocket<typeof _socket>);
});

// TODO expose
server.listen(8080, "0.0.0.0", () => {
  console.log("server started on: ", server.address());
});

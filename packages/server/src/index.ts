import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import sessionMiddleware from "./middlewares/session";
import corsMiddleware, { corsOptions } from "./middlewares/cors";
import { authenticate as expressAuth } from "./middlewares/express/authenticate";
import { authenticate as socketAuth } from "./middlewares/socket.io/authenticate";
import authController from "./controllers/authController";
import roomsController from "./controllers/roomsController";
import { registerHandlersForControls } from "./namespaces/controls/controls";
import { registerHandlersForChat } from "./namespaces/chat/chat";
import { roomMiddleware } from "./middlewares/socket.io/room";
import { registerHandlersForGlobal } from "./namespaces/global/global";

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

io.use(socketAuth)
  .use(roomMiddleware)
  .on("connection", async (socket) => {
    console.log("User connected to global");
    registerHandlersForGlobal(io, socket);
  });

io.of("drawings")
  .use(socketAuth)
  .use(roomMiddleware)
  .on("connection", (socket) => {
    console.log("User connected to drawings");
    socket.join(socket.request.session.roomId!);
  });

io.of("chat")
  .use(socketAuth)
  .use(roomMiddleware)
  .on("connection", (socket) => {
    console.log("User connected to chat");
    socket.join(socket.request.session.roomId!);
    registerHandlersForChat(io, socket);
  });

io.of("controls")
  .use(socketAuth)
  .use(roomMiddleware)
  .on("connection", (socket) => {
    console.log("User connected to controls");
    socket.join(socket.request.session.roomId!);
    registerHandlersForControls(io, socket);
  });

// TODO expose
server.listen(8080, "0.0.0.0", () => {
  console.log("server started on: ", server.address());
});

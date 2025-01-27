import express, { type Request } from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import sessionMiddleware from "./middlewares/session";
import corsMiddleware from "./middlewares/cors";
import authController from "./controllers/authController";
import { authenticate } from "./middlewares/authenticate";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(corsMiddleware);
app.use(sessionMiddleware);

io.engine.use(corsMiddleware);
io.engine.use(sessionMiddleware);

io.of("chat").on("connection", (socket) => {
  const session = (socket.request as Request).session;

  if (!session || !session.data) {
    console.log("Not authenticated");
  } else {
    console.log("Authenticated");
  }

  console.log("a user connected to chat");
});

io.of("drawings").on("connection", (socket) => {
  console.log("a user connected to drawings");

  socket.onAny((...args) => {
    console.log(args);
  });

  socket.on("draw", (args) => {
    console.log(args);
  });
});

io.of("controls").on("connection", (socket) => {
  console.log("a user connected to controls");
});

io.on("connection", (socket) => {
  console.log("a user connected globally");
});

app.use(authController);

server.listen(8080, () => {
  console.log("server running at http://localhost:8080");
});

app.get("/", authenticate, (req, res) => {
  res.send("Hello World!");
});

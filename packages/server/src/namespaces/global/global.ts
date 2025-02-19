import type { Server, Socket } from "socket.io";
import userService from "../../services/userService";
import type { GameConfig, Player } from "@guessthesketch/common";
import { GlobalState } from "../../classes/states/GlobalState";

export function registerHandlersForGlobal(io: Server, socket: Socket) {
  const state = GlobalState.getInstance();
  const userId = socket.request.session.userId;
  const roomId = socket.request.session.roomId!;

  socket.on("ready", async () => {
    const user = await userService.getUserById(userId);
    const room = state.getRoomById(roomId);

    if (user === null) {
      socket.disconnect();
      console.log("User doesn't exist");
      return;
    }

    if (room === null) {
      socket.disconnect();
      console.log("Room doesn't exist");
      return;
    }

    room.addPlayer(userId, user.username);

    const allPlayers = room.getAllPlayers();
    const player: Player = {
      id: userId,
      name: user.username,
    };

    socket.emit("all players", allPlayers);
    socket.join(roomId);
    socket.to(roomId).emit("player joined room", player);
  });

  socket.on("disconnect", () => {
    const room = state.getRoomById(roomId);
    room?.removePlayer(userId);

    socket.to(roomId).emit("player left room", userId);

    // TODO session
  });

  socket.on("start game", (config: GameConfig) => {
    const room = state.getRoomById(roomId);

    if (room === null) {
      return console.log(`Can't find room`);
    }

    if (room.ownerId !== userId) {
      return console.log(`You are not the owner of the room`);
    }

    // TODO validate config
    room.startGame(config);
    io.to(roomId).emit("start game");
  });
}

// type ack = (_: { success: boolean; ownerId?: PlayerId }) => void;
// socket.on("get room owner", (roomId: string, callback: ack) => {
//   const room = state.getRoomById(roomId);

//   if (room) {
//     const result: GetRoomOwnerResult = {
//       success: true,
//       ownerId: room.ownerId,
//     };
//     callback(result);
//   } else {
//     const result: GetRoomOwnerResult = {
//       success: false,
//     };
//     callback(result);
//   }
// });

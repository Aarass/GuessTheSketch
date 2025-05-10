import type { ChatMessage, ChatSocket, GameConfig } from "@guessthesketch/common";
import type { GuardedSocket } from "../../utility/guarding";
import { type MyNamespaces } from "../..";
import { GlobalState } from "../../classes/states/GlobalState";
import userService from "../../services/userService";

export function registerHandlersForChat(
  namespaces: MyNamespaces,
  socket: GuardedSocket<ChatSocket>
) {
  const userId = socket.request.session.userId;
  const roomId = socket.request.session.roomId;
  const state = GlobalState.getInstance();

  socket.join(roomId);
  
  

  socket.on("ready", () => {
    const config = state.getRoomById(roomId)?.getCurentGame()?.getGameConfig();
    
    if(config){
      namespaces.chatNamespace.to(socket.id).emit("start game", config);
      console.log(`Saljem GAME CONFIG za : ${socket.id}`);
    }
    else{
      socket.to(socket.id).emit("game-config-not-set");
      console.log("GAME CONFIG jos nije psotavljen");
    }
  })

  socket.on("join-team", (team: string) => {
    console.log(`CHAT: JOIN-TEAM`);
    socket.join(`${team}-${roomId}`);
  })
  
  socket.on("join-drawing-room", () => {
    socket.join(`drawing-${roomId}`);
    console.log(`Igrac-${userId} je uso u sobu za crtanje`)
  })

  socket.on("leave-drawing-room", () =>{
    socket.leave(`drawing-${roomId}`);
    console.log(`CHAT: NAPUSTIO SOBU ZA CRTANJE`);
  })

  socket.on("chat message", (message: string) => {
    console.log(`CHAT: STIGLA PORUKA`);
    const room = state.getRoomById(roomId);
    if (!room) return;

    const game = room.currentGame;
    if (!game) return;

    const playerTeam = game.findPlayersTeam(userId);
    if (!playerTeam) return;

    const isCorrectGuess = game.getCurrentRound()?.isCorrectGuess(message) ?? false;

    if (isCorrectGuess && !room.getPlayersInDrawingRoom().has(userId)) {

      playerTeam.players.forEach(player => {
        room.addPlayerToDrawingRoom(player);
        console.log(`${player}`)
      });

      game.guess(message, userId);
      socket.join(`drawing-${roomId}`);
      socket.to(`${playerTeam.name}-${roomId}`).emit("join-drawing-room");
      console.log(`Igrac-${userId} je uso u sobu za crtanje`)
      return;
    }

    const newMessage: ChatMessage = {
      user: userId,
      message: message
    }

    if(room.getPlayersInDrawingRoom().has(userId)){
      namespaces.chatNamespace.to(`drawing-${roomId}`).emit("chat message", newMessage)
      room.getPlayersInDrawingRoom().forEach(element => {
        console.log(`${element}`)
      });
    } else {
      namespaces.chatNamespace.to(roomId).emit("chat message", newMessage);
    }

    

  
  })

}

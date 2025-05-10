import { useEffect, useRef, useState } from "react"
import { useAppSelector } from "../../app/hooks"
import { selectMyId } from "../auth/AuthSlice"
import { backend, sockets } from "../../global"
import { io } from "socket.io-client"
import { ChatMessage, GameConfig, PlayerId, Team } from "@guessthesketch/common"
import { selectRoomInfo } from "../rooms/RoomSlice"

export const Chat = () => {
  const myId = useAppSelector(selectMyId)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const teamName = useRef("");
  const [drawingTeam, setDrawingTeam] = useState<string | null>(null); // Čeka ako round-started dođe pre start game

  useEffect(() => {
    if (!myId) return; // Čekaj da myId bude definisan

    if (!sockets.chat) {
      sockets.chat = io(`ws://${backend}/chat`, {
        withCredentials: true, // ako koristite autentifikaciju sa kolačićima
      })
    }

    
    // 🌟 Event: Kad igra počne, saznaj tim
    sockets.chat.on("start game", (config: GameConfig) => {
      console.log("🏁 Start game primljen!");
      const myTeam = getTeamName(myId, config);
       // Postavi tim korisnika
      
      if (myTeam) {
        teamName.current = myTeam;
        console.log(`🚀 Pridružujem se timu: ${myTeam}`);
        sockets.chat?.emit("join-team", myTeam);
      }
      else{
        teamName.current = "Nemam tim";
      }
      
      const drwTeam = getDrawingTeam(config);
      setDrawingTeam(drwTeam);
      
      if(myTeam == drwTeam){
        console.log("Moja ekipa prva crta")
        sockets.chat?.emit("join-drawing-room")
      }
    });
    
    // 🎭 Event: Kraj runde, svi izlaze iz drawing room-a
    sockets.chat.on("round-started", (drawingTeam) => {
      console.log(`Sad crta: ${drawingTeam}`);
      if(teamName.current === drawingTeam){
        console.log(`Stvarno crta: ${drawingTeam}`);
        sockets.chat?.emit("join-drawing-room");
      }
    });
    
    
    // 🎭 Event: Kraj runde, svi izlaze iz drawing room-a
    sockets.chat.on("round-ended", () => {
      console.log("🚪 Napuštam drawing room");
      sockets.chat?.emit("leave-drawing-room");
    });
    
    // Kada server pošalje novu poruku
    sockets.chat.on("chat message", (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      console.log("stigla poruka")
    });
    
    sockets.chat.on("join-drawing-room", () => {
      sockets.chat?.emit("join-drawing-room");
    })
    
    sockets.chat.emit("ready");
    
    // Kada se komponenta demontira, odjavite se od svih događaja
    return () => {
      sockets.chat?.off("chat message");
      sockets.chat?.off("start game");
      sockets.chat?.off("round-started");
      sockets.chat?.off("round-ended");
      sockets.chat?.off("join-drawing-room");
    };
  

  }, [])

  const getDrawingTeam = (config: GameConfig): string | null => {
    return config.teams[0].name;
  }


  // 🕵️‍♂️ Funkcija za traženje korisnikovog tima u game config-u
  const getTeamName = (userId: PlayerId, config: GameConfig): string | null => {
    for (const team of config.teams) {
      if (team.players.includes(userId)) {
        console.log(`👥 Korisnik ${userId} je u timu: ${team.name}`);
        return team.name;
      }
    }
    console.log(`❌ Korisnik ${userId} nije pronađen u nijednom timu`);
    return null;
  };
  

  // Funkcija za slanje poruke
  const sendMessage = () => {
    if (newMessage.trim()) {
      // Emituj poruku na server
      sockets.chat?.emit("chat message", newMessage);

      setNewMessage(""); // Očisti input nakon slanja
    }
  };


  return (
    <div className="chat-container">
      <h2>Chat Room</h2>

      {/* Prikazivanje svih poruka */}
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.user}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>

      {/* Unos nove poruke */}
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

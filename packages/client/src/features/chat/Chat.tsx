import { ChatMessage } from "@guessthesketch/common"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useAppSelector } from "../../app/hooks"
import { backend, sockets } from "../../global"
import { selectMyId } from "../auth/AuthSlice"

export const Chat = () => {
  const myId = useAppSelector(selectMyId)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    if (!myId) return;

    if (!sockets.chat) {
      sockets.chat = io(`ws://${backend}/chat`)
    }

    // Kada drugi igrac pošalje poruku
    sockets.chat.on("message", (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      console.log("stigla poruka")
    });


    return () => {
      sockets.chat?.off("message");
    };
  }, [])


  // Funkcija za slanje poruke
  const sendMessage = () => {
    const msg =  newMessage.trim()

    if (msg) {
      sockets.chat?.emit("message", msg); // Emituj poruku na server
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


      <form
        onSubmit={async e => {
          e.preventDefault()
            sendMessage()
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
          <button type="submit">Send</button>
      </form>
      </div>
    </div>
  );
}

import { ChatMessage } from "@guessthesketch/common"
import { useEffect, useState } from "react"
import { ConnectionManager } from "../../classes/ConnectionManager"
import { sockets } from "../../global"

/**
 * myId and roomId must be set
 */
export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState<string>("")

  useEffect(() => {
    ConnectionManager.getInstance().ensureChatIsConnected()

    sockets.chat!.on("message", onMessage)
    return () => {
      sockets.chat?.off("message", onMessage)
    }
  }, [])

  function onMessage(message: ChatMessage) {
    setMessages(prevMessages => [...prevMessages, message])
  }

  function sendMessage() {
    const msg = newMessage.trim()

    if (msg) {
      sockets.chat?.emit("message", msg)
      setNewMessage("")
    }
  }

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
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}

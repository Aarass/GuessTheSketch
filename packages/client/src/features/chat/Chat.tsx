import { ChatMessage, PlayerId } from "@guessthesketch/common"
import { useContext, useEffect, useRef, useState } from "react"
import { useAppSelector } from "../../app/hooks"
import { sockets } from "../../global"
import { Context } from "../context/Context"
import { selectIsMyTeamOnMove } from "../gameScreen/GameScreenSlice"
import { selectPlayers } from "../rooms/RoomSlice"
/**
 * myId and roomId must be set
 */
export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState<string>("")
  const isMyTeamOnMove = useAppSelector(selectIsMyTeamOnMove)
  const inputRef = useRef<HTMLInputElement>(null)
  const allPlayers = useAppSelector(selectPlayers)

  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(`Context is undefined`)
  }

  const connManager = context.connectionManager

  function pushMessage(message: Message) {
    setMessages(prevMessages => [...prevMessages, message])
  }

  useEffect(() => {
    connManager.ensureGlobalIsConnected

    function onStart() {
      if (!isMyTeamOnMove) {
        inputRef.current?.focus()
      }
    }

    sockets.global!.on("round started", onStart)
    return () => {
      sockets.global!.off("round started", onStart)
    }
  }, [isMyTeamOnMove])

  useEffect(() => {
    connManager.ensureChatIsConnected()

    function onMessage(message: ChatMessage) {
      const player = allPlayers.find(p => p.id === message.user)

      pushMessage({
        type: "normal",
        playerName: player?.name ?? "No name",
        content: message.message,
      })
    }

    function onCorrectGuess(playerId: PlayerId) {
      const player = allPlayers.find(p => p.id === playerId)

      pushMessage({
        type: "correct",
        content: `${player?.name ?? "No name"} guessed correctly`,
      })
    }

    sockets.chat!.on("message", onMessage)
    sockets.chat!.on("correct guess", onCorrectGuess)
    return () => {
      sockets.chat?.off("message", onMessage)
      sockets.chat?.off("correct guess", onCorrectGuess)
    }
  }, [allPlayers])

  function sendMessage() {
    const msg = newMessage.trim()

    if (msg) {
      sockets.chat?.emit("message", msg)
      setNewMessage("")
    }
  }

  return (
    <div className="h-[500px] flex flex-col w-3xs">
      {/* Prikazivanje svih poruka */}
      <div className="grow overflow-scroll pr-2">
        <div className="flex flex-col-reverse">
          {messages.map((msg, index) => (
            <div key={index} className="flex max-w-full">
              {msg.type === "normal" ? (
                <p className="max-w-full my-0.5 break-all text-wrap">
                  <strong>{msg.playerName}: </strong>
                  {msg.content}
                </p>
              ) : (
                <p className="max-w-full my-0.5 break-all text-wrap text-green-500">
                  {msg.content}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Unos nove poruke */}
      <div className="w-full mt-4">
        <form
          onSubmit={async e => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Guess"
            className="w-full"
          />
        </form>
      </div>
    </div>
  )
}

type Message =
  | {
      type: "normal"
      playerName: string
      content: string
    }
  | {
      type: "correct"
      content: string
    }

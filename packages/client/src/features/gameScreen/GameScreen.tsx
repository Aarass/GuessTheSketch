import { useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { ConnectionManager } from "../../classes/ConnectionManager"
import { Chat } from "../chat/Chat"
import { LogoutButton } from "../global/Logout"
import { Leaderboard } from "../leaderboard/Leaderboard"
import { selectRoomId, tryRestore } from "../rooms/RoomSlice"
import { Canvas } from "./Canvas"
import { selectIsMyTeamOnMove } from "./GameScreenSlice"
import { Tools } from "./Tools"
import { Word } from "./wordToGuess/Word"

/**
 * myId must be set when mounting this component
 */
export const GameScreen = () => {
  const dispatch = useAppDispatch()

  const roomId = useAppSelector(selectRoomId)
  const isMyTeamOnMove = useAppSelector(selectIsMyTeamOnMove)

  const sentRestoreRequest = useRef(false)

  useEffect(() => {
    if (!roomId) {
      // Ako udje u ovaj if znaci da je refreshana stranica

      console.log("nema configa")

      if (!sentRestoreRequest.current) {
        sentRestoreRequest.current = true

        dispatch(tryRestore())
      }
      return
    }

    ConnectionManager.getInstance().ensureGlobalIsConnected()
  }, [roomId])

  const canCreateSocketConnection = !!roomId

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <DebugButtons />
      {canCreateSocketConnection ? (
        <div className="flex">
          <Leaderboard></Leaderboard>
          <div className="flex flex-col items-center">
            <Word />
            <Canvas />
            {isMyTeamOnMove ? <Tools /> : null}
          </div>
          <Chat></Chat>
        </div>
      ) : null}
    </div>
  )
}

function DebugButtons() {
  const navigate = useNavigate()

  return (
    <div className="flex">
      <button
        onClick={() => {
          navigate("/rooms")
        }}
      >
        Rooms
      </button>

      <button
        onClick={() => {
          navigate("/lobby")
        }}
      >
        Lobby
      </button>

      <LogoutButton />
    </div>
  )
}

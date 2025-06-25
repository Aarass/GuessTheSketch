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
import { sockets } from "../../global"
import { Clock } from "./clock/Clock"
import { RoundsCount } from "./rounds/RoundsCount"

/**
 * myId must be set when mounting this component
 */
export const GameScreen = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

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

    sockets.global!.on("game ended", onGameEnded)

    return () => {
      sockets.global?.off("game ended", onGameEnded)
    }
  }, [roomId])

  function onGameEnded() {
    navigate("/end")
  }

  const canCreateSocketConnection = !!roomId

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      {canCreateSocketConnection ? (
        <>
          <div className="w-full flex gap-20 justify-center items-center">
            <Clock />
            <Word />
            <RoundsCount />
          </div>
          <div className="flex gap-4 mt-8">
            <Leaderboard></Leaderboard>
            <div className="flex flex-col items-center">
              <Canvas />
            </div>
            <Chat />
          </div>
          {isMyTeamOnMove ? <Tools /> : null}
        </>
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

// <div className="w-full flex justify-between">
//   <div className="relative">
//     <div className="absolute flex gap-8 mx-40">
//       <Clock />
//       <RoundsCount />
//     </div>
//   </div>
//   <Word />
//   <div className="" />
// </div>

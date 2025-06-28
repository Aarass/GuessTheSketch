import { useContext, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { sockets } from "../../global"
import { Chat } from "../chat/Chat"
import { Context } from "../context/Context"
import { Leaderboard } from "../leaderboard/Leaderboard"
import { selectRoomId, tryRestore } from "../rooms/RoomSlice"
import { Canvas } from "./Canvas"
import { Clock } from "./clock/Clock"
import {
  selectIsMyTeamOnMove,
  tryRestoreConfig,
  tryRestoreLeaderboard,
  tryRestoreTeamOnMove,
} from "./GameScreenSlice"
import { RoundsCount } from "./rounds/RoundsCount"
import { Tools } from "./Tools"
import { Word } from "./wordToGuess/Word"

/**
 * myId must be set when mounting this component
 */
export const GameScreen = () => {
  const navigate = useNavigate()

  const roomId = useAppSelector(selectRoomId)
  const isMyTeamOnMove = useAppSelector(selectIsMyTeamOnMove)

  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(`Context is undefined`)
  }

  const state = context.gameState
  const connManager = context.connectionManager

  useRestore()

  useEffect(() => {
    function onRoundEnded() {
      state?.reset()
    }

    function onGameEnded() {
      navigate("/end")
    }

    connManager.ensureGlobalIsConnected()

    sockets.global!.on("round ended", onRoundEnded)
    sockets.global!.on("game ended", onGameEnded)
    return () => {
      sockets.global?.off("round ended", onRoundEnded)
      sockets.global?.off("game ended", onGameEnded)
    }
  }, [])

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

function useRestore() {
  const dispatch = useAppDispatch()
  const sentRestoreRequest = useRef(false)
  const roomId = useAppSelector(selectRoomId)
  const context = useContext(Context)

  const state = context?.gameState

  useEffect(() => {
    // Ako udje u ovaj if znaci da je refreshana stranica
    if (roomId === undefined) {
      if (!sentRestoreRequest.current) {
        sentRestoreRequest.current = true

        dispatch(tryRestore())
      }
    }
  }, [roomId])

  useEffect(() => {
    if (!roomId) return

    if (sentRestoreRequest.current) {
      dispatch(tryRestoreConfig())
      dispatch(tryRestoreLeaderboard())
      dispatch(tryRestoreTeamOnMove())

      state?.tryRestoreDrawings()
    }
  }, [roomId])
}

// function DebugButtons() {
//   const navigate = useNavigate()
//
//   return (
//     <div className="flex">
//       <button
//         onClick={() => {
//           navigate("/rooms")
//         }}
//       >
//         Rooms
//       </button>
//
//       <button
//         onClick={() => {
//           navigate("/lobby")
//         }}
//       >
//         Lobby
//       </button>
//
//       <LogoutButton />
//     </div>
//   )
// }

import { ProcessedGameConfig } from "@guessthesketch/common"
import { useContext, useEffect } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch } from "../../app/hooks"
import { sockets } from "../../global"
import { Context } from "../context/Context"
import { setConfig as setConfigAction } from "../gameScreen/GameScreenSlice"
import { Leaderboard } from "../leaderboard/Leaderboard"

export function EndScreen() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(`Context is undefined`)
  }

  const connManager = context.connectionManager

  const onGameStarted = (config: ProcessedGameConfig) => {
    dispatch(setConfigAction(config))
    navigate("/game")
  }

  useEffect(() => {
    connManager.ensureGlobalIsConnected()

    sockets.global!.on("game started", onGameStarted)
    return () => {
      sockets.global?.off("game started", onGameStarted)
    }
  }, [])

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <button
        className="mb-4"
        onClick={() => {
          navigate("/lobby")
        }}
      >
        Lobby
      </button>
      <Leaderboard />
    </div>
  )
}

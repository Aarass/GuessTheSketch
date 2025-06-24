import { ProcessedGameConfig } from "@guessthesketch/common"
import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch } from "../../app/hooks"
import { ConnectionManager } from "../../classes/ConnectionManager"
import { sockets } from "../../global"
import { setConfig as setConfigAction } from "../gameScreen/GameScreenSlice"
import { Leaderboard } from "../leaderboard/Leaderboard"

export function EndScreen() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const onGameStarted = (config: ProcessedGameConfig) => {
    dispatch(setConfigAction(config))
    navigate("/game")
  }

  useEffect(() => {
    ConnectionManager.getInstance().ensureGlobalIsConnected()

    sockets.global!.on("game started", onGameStarted)
  })

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <button
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

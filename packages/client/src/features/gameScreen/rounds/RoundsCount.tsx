import { useEffect, useState } from "react"
import { ConnectionManager } from "../../../classes/ConnectionManager"
import { sockets } from "../../../global"
import { LuHash } from "react-icons/lu"
import { getRoundsCountRequest } from "../../restore/restoreApi"

export function RoundsCount() {
  const [text, setText] = useState("")

  useEffect(() => {
    ;(async () => {
      const res = await getRoundsCountRequest()
      const body = (await res.json()) as { started: number; max: number }

      setText(`${body.started}/${body.max}`)
    })()
  }, [])

  useEffect(() => {
    ConnectionManager.getInstance().ensureGlobalIsConnected()

    sockets.global!.on("rounds count", onRoundsCount)
    return () => {
      sockets.global?.off("rounds count", onRoundsCount)
    }
  }, [])

  function onRoundsCount(startedRounds: number, maxRounds: number) {
    setText(`${startedRounds}/${maxRounds}`)
  }

  return (
    <div className="flex items-center">
      <LuHash /> {text}
    </div>
  )
}

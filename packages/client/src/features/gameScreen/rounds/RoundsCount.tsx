import { useContext, useEffect, useState } from "react"
import { LuHash } from "react-icons/lu"
import { sockets } from "../../../global"
import { Context } from "../../context/Context"
import { getRoundsCountRequest } from "../../restore/restoreApi"

export function RoundsCount() {
  const [text, setText] = useState("")
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(`Context is undefined`)
  }

  const connManager = context.connectionManager

  useEffect(() => {
    ;(async () => {
      const res = await getRoundsCountRequest()
      const body = (await res.json()) as { started: number; max: number }

      setText(`${body.started}/${body.max}`)
    })()
  }, [])

  useEffect(() => {
    connManager.ensureGlobalIsConnected()

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

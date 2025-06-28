import { useContext, useEffect, useRef, useState } from "react"
import { LuAlarmClock } from "react-icons/lu"
import { useStore } from "react-redux"
import { AppStore } from "../../../app/store"
import { sockets } from "../../../global"
import { Context } from "../../context/Context"
import { getClockRequest } from "../../restore/restoreApi"
import { selectRoundDuration } from "../GameScreenSlice"

export function Clock() {
  const store = useStore() as AppStore
  const [clock, setClock] = useState(0)
  const handle = useRef<number | undefined>()

  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(`Context is undefined`)
  }

  const connManager = context.connectionManager

  function startCountdown() {
    handle.current = window.setInterval(() => {
      setClock(prev => Math.max(prev - 1, 0))
    }, 1000)
  }

  function stopCountdown() {
    clearInterval(handle.current)
    handle.current = undefined
    setClock(0)
  }

  useEffect(() => {
    ;(async () => {
      const res = await getClockRequest()
      const body = (await res.json()) as { clock: number | null }

      // U medjuvremenu se desio roundStart
      if (handle.current) return

      if (body.clock !== null) {
        setClock(Math.floor(body.clock / 1000))
        startCountdown()
      }
    })()
  }, [])

  useEffect(() => {
    connManager.ensureGlobalIsConnected()

    function onRoundStart() {
      const duration = selectRoundDuration(store.getState())
      setClock((duration ?? 999000) / 1000 - 1)
      startCountdown()
    }

    function onRoundEnd() {
      stopCountdown()
    }

    sockets.global!.on("round started", onRoundStart)
    sockets.global!.on("round ended", onRoundEnd)
    return () => {
      sockets.global?.off("round started", onRoundStart)
      sockets.global?.off("round ended", onRoundEnd)
    }
  }, [])

  return (
    <div className="flex items-center">
      <LuAlarmClock className="mr-1" /> {clock}
    </div>
  )
}

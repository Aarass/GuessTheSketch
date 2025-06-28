import { useEffect, useRef, useState } from "react"
import { AppStore } from "../../../app/store"
import { ConnectionManager } from "../../../classes/ConnectionManager"
import { sockets } from "../../../global"
import { selectRoundDuration } from "../GameScreenSlice"
import { LuAlarmClock } from "react-icons/lu"
import { getClockRequest } from "../../restore/restoreApi"
import { useStore } from "react-redux"

export function Clock() {
  const store = useStore() as AppStore
  const [clock, setClock] = useState(0)
  const handle = useRef<number | undefined>()

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
    ConnectionManager.getInstance().ensureGlobalIsConnected()

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

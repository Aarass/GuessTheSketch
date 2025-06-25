import { useEffect, useRef, useState } from "react"
import { store } from "../../../app/store"
import { ConnectionManager } from "../../../classes/ConnectionManager"
import { sockets } from "../../../global"
import { selectRoundDuration } from "../GameScreenSlice"
import { LuAlarmClock } from "react-icons/lu"

export function Clock() {
  const [clock, setClock] = useState(0)
  const handle = useRef<number | undefined>()

  useEffect(() => {
    ConnectionManager.getInstance().ensureGlobalIsConnected()

    function onRoundStart() {
      if (handle.current) {
        clearInterval(handle.current)
      }

      const duration = selectRoundDuration(store.getState())
      if (duration === undefined) return

      setClock(duration / 1000 - 1)

      handle.current = window.setInterval(() => {
        setClock(prev => Math.max(prev - 1, 0))
      }, 1000)
    }

    function onRoundEnd() {
      clearInterval(handle.current)
    }

    sockets.global!.on("round started", onRoundStart)
    sockets.global!.on("round ended", onRoundEnd)
    return () => {
      sockets.global?.off("round started", onRoundStart)
      sockets.global?.off("round ended", onRoundEnd)
    }
  }, [])

  useEffect(() => {
    return () => {
      clearInterval(handle.current)
      handle.current = undefined
    }
  }, [])

  return (
    <div className="flex items-center">
      <LuAlarmClock className="mr-1" /> {clock}
    </div>
  )
}

import { useEffect } from "react"
import { useAppSelector } from "../../app/hooks"
import { selectMyId } from "../auth/AuthSlice"
import { backend, sockets } from "../../global"
import { io } from "socket.io-client"

export const Chat = () => {
  const myId = useAppSelector(selectMyId)

  useEffect(() => {
    if (myId === null) return

    if (sockets.chat === null) {
      sockets.chat = io(`ws://${backend}/chat`)
    }
  }, [])
  return <div>{/* <p>chat</p> */}</div>
}

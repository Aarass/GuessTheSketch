import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { LogoutButton } from "../global/Logout"
import { createRoom, joinRoom, selectRoomInfo } from "./RoomSlice"

/**
 * myId must be set when mounting this component
 */
export function Rooms() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [localRoomId, setLocalRoomId] = useState("")

  const roomInfo = useAppSelector(selectRoomInfo)
  useEffect(() => {
    if (roomInfo.id !== null && roomInfo.ownerId !== null) {
      navigate("/lobby")
    }
  }, [roomInfo])

  return (
    <div className="flex h-full w-full items-center justify-center">
      <form
        onSubmit={e => {
          e.preventDefault()

          if (localRoomId.length) {
            dispatch(joinRoom(localRoomId))
          }
        }}
      >
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => {
              dispatch(createRoom())
            }}
          >
            Create room
          </button>

          <input
            type="text"
            value={localRoomId}
            onChange={e => setLocalRoomId(e.target.value)}
          />

          <button type="submit">Join room</button>
        </div>
      </form>
      <LogoutButton />
    </div>
  )
}

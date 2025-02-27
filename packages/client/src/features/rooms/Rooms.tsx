import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectMyId } from "../auth/AuthSlice"
import { NotLoggedIn } from "../auth/RedirectToLoginScreen"
import { useNavigate } from "react-router"
import { joinRoom, createRoom, selectRoomInfo } from "./RoomSlice"
import { LogoutButton } from "../global/Logout"

export function Rooms() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [localRoomId, setLocalRoomId] = useState("")
  const myId = useAppSelector(selectMyId)

  const roomInfo = useAppSelector(selectRoomInfo)
  useEffect(() => {
    if (myId === null) return

    if (roomInfo.id !== null && roomInfo.ownerId !== null) {
      navigate("/lobby")
    }
  }, [roomInfo, myId])

  // return myId ? (
  return true ? (
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
  ) : (
    NotLoggedIn()
  )
}

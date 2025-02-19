import { JoinRoomResult } from "@guessthesketch/common"
import { backend } from "../../global"

export async function createRoom() {
  const res = await fetch(`http://${backend}/rooms/`, {
    method: "post",
    credentials: "include",
  })

  const json = await res.json()
  if (!json.roomId) throw `Error`
  return json.roomId as string
}

export async function joinRoom(roomId: string) {
  const res = await fetch(`http://${backend}/rooms/${roomId}/join`, {
    method: "post",
    credentials: "include",
  })

  return (await res.json()) as JoinRoomResult
}

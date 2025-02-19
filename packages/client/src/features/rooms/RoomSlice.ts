import { Player, PlayerId, RoomId } from "@guessthesketch/common"
import { createAppSlice } from "../../app/createAppSlice"
import {
  createRoom as createRoomRequest,
  joinRoom as joinRoomRequest,
} from "./roomsApi"
import { PayloadAction } from "@reduxjs/toolkit"

const initialState = {
  roomId: null as RoomId | null,
  ownerId: null as PlayerId | null,
  players: [] as Player[],
}

export const roomSlice = createAppSlice({
  name: "room",
  initialState,
  reducers: create => ({
    createRoom: create.asyncThunk(
      async () => {
        return await joinRoomRequest(await createRoomRequest())
      },
      {
        fulfilled: (state, action) => {
          const data = action.payload

          state.roomId = data.roomId
          state.ownerId = data.ownerId
        },
      },
    ),
    joinRoom: create.asyncThunk(
      async (roomId: string) => {
        return await joinRoomRequest(roomId)
      },
      {
        fulfilled: (state, action) => {
          const data = action.payload

          state.roomId = data.roomId
          state.ownerId = data.ownerId
        },
      },
    ),
    syncPlayers: create.reducer((state, action: PayloadAction<Player[]>) => {
      state.players = action.payload
    }),
    playerJoined: create.reducer((state, action: PayloadAction<Player>) => {
      state.players.push(action.payload)
    }),
    playerLeft: create.reducer((state, action: PayloadAction<PlayerId>) => {
      const i = state.players.findIndex(p => p.id == action.payload)
      if (i >= 0) {
        state.players.splice(i, 1)
      }
    }),
  }),
  selectors: {
    selectRoomId: state => state.roomId,
    selectRoomOwnerId: state => state.ownerId,
    selectRoomInfo: state => ({
      id: state.roomId,
      ownerId: state.ownerId,
    }),
    selectPlayers: state => state.players,
  },
})

export const { createRoom, joinRoom, syncPlayers, playerJoined, playerLeft } =
  roomSlice.actions
export const {
  selectRoomId,
  selectRoomOwnerId,
  selectRoomInfo,
  selectPlayers,
} = roomSlice.selectors

// getRoomOwner: create.asyncThunk(
//   async (roomId: RoomId) => {
//     const response = (await sockets.global?.emitWithAck(
//       "get room owner",
//       roomId,
//     )) as GetRoomOwnerResult
//     if (response.success) {
//       return response.ownerId
//     } else {
//       throw `Error`
//     }
//   },
//   {
//     fulfilled: (state, action) => {
//       console.log("fulfilled", action.payload)
//       state.ownerId = action.payload
//     },
//   },
// ),

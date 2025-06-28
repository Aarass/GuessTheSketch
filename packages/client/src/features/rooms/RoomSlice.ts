import { Player, PlayerId, RoomId } from "@guessthesketch/common"
import { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { logout } from "../auth/AuthSlice"
import {
  createRoom as createRoomRequest,
  joinRoom as joinRoomRequest,
  tryRefreshRoom as tryRefreshRoomRequest,
} from "./roomsApi"

const initialState = {
  roomId: undefined as RoomId | null | undefined,
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
    tryRestore: create.asyncThunk(
      async () => {
        const { ownerId, roomId } = await tryRefreshRoomRequest()
        return [roomId, ownerId] as const
      },
      {
        fulfilled: (state, action) => {
          const [roomId, ownerId] = action.payload

          state.ownerId = ownerId
          state.roomId = roomId
        },
        rejected: state => {
          state.roomId = null
        },
      },
    ),
    syncPlayers: create.reducer((state, action: PayloadAction<Player[]>) => {
      state.players = action.payload
    }),
    ownerChanged: create.reducer((state, action: PayloadAction<PlayerId>) => {
      state.ownerId = action.payload
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
  extraReducers: builder => {
    builder.addCase(logout.fulfilled, state => {
      state.ownerId = initialState.ownerId
      state.roomId = initialState.roomId
      state.players = []
    })
  },
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

export const {
  createRoom,
  joinRoom,
  tryRestore,
  syncPlayers,
  ownerChanged,
  playerJoined,
  playerLeft,
} = roomSlice.actions
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

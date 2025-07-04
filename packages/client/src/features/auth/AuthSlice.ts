import { createAppSlice } from "../../app/createAppSlice"
import { sockets } from "../../global"
import {
  login as loginRequest,
  logout as logoutRequest,
  refresh as refreshRequest,
} from "./authApi"
import { LoginResult, PlayerId, RefreshResult } from "@guessthesketch/common"

interface AuthState {
  myId: PlayerId | null | undefined
}

const initialState: AuthState = { myId: undefined }

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: create => ({
    login: create.asyncThunk(
      async (username: string) => {
        const res = await loginRequest(username)
        const body = (await res.json()) as LoginResult
        return body
      },
      {
        fulfilled: (state, action) => {
          state.myId = action.payload.id
        },
        rejected: state => {
          state.myId = null
        },
      },
    ),
    refresh: create.asyncThunk(
      async () => {
        const res = await refreshRequest()
        const body = (await res.json()) as RefreshResult
        return body
      },
      {
        fulfilled: (state, action) => {
          state.myId = action.payload.id
          console.log("**** Ovo je trenutak kad imam userId")
        },
        rejected: state => {
          state.myId = null
        },
      },
    ),
    logout: create.asyncThunk(
      async () => {
        await logoutRequest()
      },
      {
        fulfilled: state => {
          state.myId = initialState.myId

          sockets.global?.disconnect()
          sockets.global = null
          sockets.controls?.disconnect()
          sockets.controls = null
          sockets.drawings?.disconnect()
          sockets.drawings = null
          sockets.chat?.disconnect()
          sockets.chat = null
        },
      },
    ),
  }),
  selectors: {
    selectMyId: state => state.myId,
  },
})

export const { login, logout, refresh } = authSlice.actions
export const { selectMyId } = authSlice.selectors

import { createAppSlice } from "../../app/createAppSlice"
import {
  login as loginRequest,
  logout as logoutRequest,
  refresh as refreshRequest,
} from "./authApi"
import { LoginResult, RefreshResult } from "@guessthesketch/common"

interface AuthState {
  myId: string | null
}

const initialState: AuthState = { myId: null }

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
        },
      },
    ),
    logout: create.asyncThunk(
      async () => {
        await logoutRequest()
      },
      {
        fulfilled: state => {
          state.myId = null
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

import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { logout } from "../auth/AuthSlice"

export interface GameScreenState {
  color: string
  size: number
}

const initialState: GameScreenState = {
  color: "#FFFFFF",
  size: 7,
}

export const gameScreenSlice = createAppSlice({
  name: "gameScreen",
  initialState,
  reducers: create => ({
    setColor: create.reducer((state, action: PayloadAction<string>) => {
      state.color = action.payload
    }),
    setSize: create.reducer((state, action: PayloadAction<number>) => {
      state.size = action.payload
    }),
  }),
  extraReducers: builder => {
    builder.addCase(logout.fulfilled, state => {
      state.color = initialState.color
      state.size = initialState.size
    })
  },
  selectors: {
    selectColor: state => state.color,
    selectSize: state => state.size,
  },
})

export const { setColor, setSize } = gameScreenSlice.actions
export const { selectColor, selectSize } = gameScreenSlice.selectors

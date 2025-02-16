import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { Tool } from "./GameScreen"

export interface GameScreenState {
  color: string
  size: number
  tool: Tool | null
}

const initialState: GameScreenState = {
  color: "#FFFFFF",
  size: 7,
  tool: null,
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
    setTool: create.reducer((state, action: PayloadAction<Tool | null>) => {
      state.tool = action.payload
    }),
  }),
  selectors: {
    selectColor: state => state.color,
    selectSize: state => state.size,
    selectTool: state => state.tool,
  },
})

export const { setColor, setSize, setTool } = gameScreenSlice.actions
export const { selectColor, selectSize, selectTool } = gameScreenSlice.selectors

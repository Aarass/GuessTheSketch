import { createSelector, type PayloadAction } from "@reduxjs/toolkit"
import type { ProcessedGameConfig, TeamId } from "@guessthesketch/common"
import { createAppSlice } from "../../app/createAppSlice"
import { logout, selectMyId } from "../auth/AuthSlice"

export interface GameScreenState {
  config: ProcessedGameConfig | undefined
  teamOnMove: TeamId | undefined
  color: string
  size: number
}

const initialState: GameScreenState = {
  config: undefined,
  teamOnMove: undefined,
  color: "#FFFFFF",
  size: 7,
}

export const gameScreenSlice = createAppSlice({
  name: "gameScreen",
  initialState,
  reducers: create => ({
    setConfig: create.reducer(
      (state, action: PayloadAction<ProcessedGameConfig>) => {
        state.config = action.payload
      },
    ),
    setTeamOnMove: create.reducer(
      (state, action: PayloadAction<TeamId | undefined>) => {
        state.teamOnMove = action.payload
      },
    ),
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
    selectConfig: state => state.config,
    selectTeamOnMove: state => state.teamOnMove,
  },
})

export const { setColor, setSize, setTeamOnMove, setConfig } =
  gameScreenSlice.actions
export const { selectColor, selectSize, selectConfig, selectTeamOnMove } =
  gameScreenSlice.selectors

export const selectIsMyTeamOnMove = createSelector(
  selectMyId,
  selectConfig,
  selectTeamOnMove,
  (myId, config, teamOnMove) => {
    if (config === undefined) {
      console.log(
        "config is undefined, when trying to check if my team is on move",
      )
      return false
    }

    if (myId === null) {
      console.log("myId is null, when trying to check if my team is on move")
      return false
    }

    if (teamOnMove === undefined) {
      return false
    }

    console.log(config.teams, myId)

    const myTeam = config.teams.find(team => {
      return team.players.includes(myId)
    })

    if (myTeam === undefined) {
      throw `This should not happen`
    }

    return myTeam.id === teamOnMove
  },
)

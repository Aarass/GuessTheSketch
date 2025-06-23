import { createSelector, type PayloadAction } from "@reduxjs/toolkit"
import type {
  ProcessedGameConfig,
  RoundReplay,
  TeamId,
} from "@guessthesketch/common"
import { createAppSlice } from "../../app/createAppSlice"
import { logout, selectMyId } from "../auth/AuthSlice"
import { sockets } from "../../global"
import { ConnectionManager } from "../../classes/ConnectionManager"
import { refresh as restoreDrawingsRequest } from "./replayApi"
import { GameState } from "./GameState"

export interface GameScreenState {
  config: ProcessedGameConfig | undefined
  teamOnMove: TeamId | undefined | null
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
      (state, action: PayloadAction<TeamId | null>) => {
        state.teamOnMove = action.payload
      },
    ),
    setColor: create.reducer((state, action: PayloadAction<string>) => {
      state.color = action.payload
    }),
    setSize: create.reducer((state, action: PayloadAction<number>) => {
      state.size = action.payload
    }),

    tryRestore: create.asyncThunk(
      async (_, { dispatch }) => {
        ConnectionManager.getInstance().ensureGlobalIsConnected()

        const { config, teamOnMove } = await sockets
          .global!.timeout(1000)
          .emitWithAck("restore")

        if (teamOnMove) {
          dispatch(restoreDrawings())
        }

        return [config, teamOnMove] as const
      },
      {
        fulfilled: (state, action) => {
          const [config, teamOnMove] = action.payload

          state.config = config
          state.teamOnMove = teamOnMove

          console.log("**** Ovo je trenutak kad imam sve sto je potrebno")
        },
      },
    ),
    restoreDrawings: create.asyncThunk(
      async () => {
        console.log("About to send replay request")
        const res = await restoreDrawingsRequest()
        const replay = (await res.json()) as RoundReplay

        console.log(replay)

        return replay
      },
      {
        fulfilled: (state, action) => {
          const replay = action.payload

          const s = GameState.getInstance()
          s.confirmedDrawings = [...replay, ...s.confirmedDrawings]
        },
      },
    ),
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

export const {
  setColor,
  setSize,
  setTeamOnMove,
  setConfig,
  tryRestore,
  restoreDrawings,
} = gameScreenSlice.actions
export const { selectColor, selectSize, selectConfig, selectTeamOnMove } =
  gameScreenSlice.selectors

export const selectIsMyTeamOnMove = createSelector(
  selectMyId,
  selectConfig,
  selectTeamOnMove,
  (myId, config, teamOnMove) => {
    if (!config) {
      console.log(
        "config is undefined, when trying to check if my team is on move",
      )
      return false
    }

    if (!myId) {
      console.log("myId is null, when trying to check if my team is on move")
      return false
    }

    if (!teamOnMove) {
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

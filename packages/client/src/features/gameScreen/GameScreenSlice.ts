import type {
  LeaderboardRecord,
  ProcessedGameConfig,
  TeamId,
} from "@guessthesketch/common"
import { createSelector, type PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { logout, selectMyId } from "../auth/AuthSlice"
import {
  getConfigRequest,
  getLeaderboardRequest,
  getTeamOnMoveRequest,
} from "../restore/restoreApi"

export interface GameScreenState {
  config: ProcessedGameConfig | undefined
  leaderboard: LeaderboardRecord | undefined
  teamOnMove: TeamId | undefined | null
  // TODO ovo pomeriti odavde
  // -------------------------------
  color: string
  size: number
  // -------------------------------
}

const initialState: GameScreenState = {
  config: undefined,
  leaderboard: undefined,
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
    setLeaderboard: create.reducer(
      (state, action: PayloadAction<LeaderboardRecord>) => {
        state.leaderboard = action.payload
      },
    ),

    tryRestoreConfig: create.asyncThunk(
      async () => {
        const res = await getConfigRequest()
        const config = (await res.json()) as ProcessedGameConfig

        return config
      },
      {
        fulfilled: (state, action) => {
          state.config = action.payload
        },
      },
    ),
    tryRestoreLeaderboard: create.asyncThunk(
      async () => {
        const res = await getLeaderboardRequest()
        const leaderboard = (await res.json()) as LeaderboardRecord

        return leaderboard
      },
      {
        fulfilled: (state, action) => {
          state.leaderboard = action.payload
        },
      },
    ),
    tryRestoreTeamOnMove: create.asyncThunk(
      async () => {
        const res = await getTeamOnMoveRequest()
        const body = (await res.json()) as { teamId: TeamId | null }

        return body.teamId
      },
      {
        fulfilled: (state, action) => {
          const teamId = action.payload
          if (teamId !== null) {
            state.teamOnMove = teamId
          }
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
    selectRoundDuration: state => state.config?.rounds.duration,
    selectTeamOnMove: state => state.teamOnMove,
    selectTeamsConfig: state => state.config?.teams,
    selectLeaderboard: state => state.leaderboard,
  },
})

export const {
  setColor,
  setSize,
  setTeamOnMove,
  setConfig,
  tryRestoreConfig,
  tryRestoreLeaderboard,
  tryRestoreTeamOnMove,
  setLeaderboard,
} = gameScreenSlice.actions

export const {
  selectColor,
  selectSize,
  selectConfig,
  selectRoundDuration,
  selectTeamOnMove,
  selectTeamsConfig,
  selectLeaderboard,
} = gameScreenSlice.selectors

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

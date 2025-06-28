import { backend } from "../../global"

export async function getDrawingsRequest() {
  return await fetch(`http://${backend}/restore/drawings`, {
    method: "get",
    credentials: "include",
  })
}

export async function getConfigRequest() {
  return await fetch(`http://${backend}/restore/config`, {
    method: "get",
    credentials: "include",
  })
}

export async function getLeaderboardRequest() {
  return await fetch(`http://${backend}/restore/leaderboard`, {
    method: "get",
    credentials: "include",
  })
}

export async function getTeamOnMoveRequest() {
  return await fetch(`http://${backend}/restore/teamOnMove`, {
    method: "get",
    credentials: "include",
  })
}

export async function getCurrectWordRequest() {
  return await fetch(`http://${backend}/restore/word`, {
    method: "get",
    credentials: "include",
  })
}

export async function getClockRequest() {
  return await fetch(`http://${backend}/restore/clock`, {
    method: "get",
    credentials: "include",
  })
}

export async function getRoundsCountRequest() {
  return await fetch(`http://${backend}/restore/roundsCount`, {
    method: "get",
    credentials: "include",
  })
}

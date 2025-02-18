import { Drawing } from "./GameScreen"

export const drawings: Drawing[] = []
export const inFly: {
  drawing: Drawing | null
  i: number | null
} = {
  drawing: null,
  i: null,
}

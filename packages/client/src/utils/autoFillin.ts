import { store } from "../app/store"
import { selectColor, selectSize } from "../features/gameScreen/GameScreenSlice"

export function DrawingAutoFillIn() {
  const color = selectColor(store.getState())
  const size = selectSize(store.getState())

  return {
    color,
    size,
  }
}

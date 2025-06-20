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

// TODO zameniti za nesto sto ce teze kreirati konflikte - neki uuid ili tako nesto
// id: Date.now().toString() as DrawingId,

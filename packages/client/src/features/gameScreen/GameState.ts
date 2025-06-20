import { Drawing, DrawingInFly, NewDrawing } from "@guessthesketch/common"
import { Tool } from "../../classes/tools/Tool"

export class GameState {
  currentTool: Tool | null = null
  drawingInFly: DrawingInFly | null = null
  confirmedDrawings: Drawing[] = []
  unconfirmedDrawings = new UnconfirmedDrawings()

  reset() {
    this.currentTool?.deactivate()

    this.currentTool = null
    this.drawingInFly = null
    this.unconfirmedDrawings = new UnconfirmedDrawings()
    this.confirmedDrawings = []
  }

  getAllDrawings(): (Drawing | NewDrawing)[] {
    return this.confirmedDrawings
    // return [...this.confirmedDrawings, ...this.unconfirmedDrawings.getAll()]
  }

  private static instance: GameState | null = null
  static getInstance() {
    if (this.instance == null) {
      this.instance = new GameState()
    }
    return this.instance
  }
}

class UnconfirmedDrawings {
  private drawings: NewDrawing[] = []

  public add(drawing: NewDrawing) {
    this.drawings.push(drawing)
  }

  public remove(drawing: NewDrawing) {
    this.drawings = this.drawings.filter(d => d !== drawing)

    if (this.drawings.length === 0) {
      this.emitEmpty()
    }
  }

  public getAll() {
    return this.drawings
  }

  private listeners: (() => void)[] = []

  /**
   * Ne mozes opet da se pretplatis iz listenera.
   * Mrzi me da prepravljam, mislim da nam svakako ne treba to.
   */
  public onEmptyOnce(listener: () => void) {
    this.listeners.push(listener)
  }

  private emitEmpty() {
    this.listeners.forEach(l => l())
    this.listeners = []
  }
}

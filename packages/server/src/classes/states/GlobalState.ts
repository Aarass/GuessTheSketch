import { RoomState } from "./RoomState";
import { RoomId } from "../../types/types";

// -----------------
// --- Singleton ---
// -----------------
export class GlobalState {
  private static instance: GlobalState | null = null;

  static getInstance() {
    if (this.instance == null) {
      this.instance = new GlobalState();
    }
    return this.instance;
  }

  private constructor(private rooms = new Map<RoomId, RoomState>()) {}

  registerRoom(roomState: RoomState) {
    this.rooms.set(roomState.id, roomState);
  }

  unregisterRoom(roomId: RoomId) {
    this.rooms.delete(roomId);
  }

  /**
   * This functions should not be in any way exposed to an
   * end users. You should call it only for room ids that you
   * manage. It will throw if bad room id is provided.
   */
  getRoomById(roomId: RoomId) {
    const res = this.rooms.get(roomId);
    if (res === undefined) {
      throw `Internal error. Can't find room with provided id`;
    }

    return res;
  }
}

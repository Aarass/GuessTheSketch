import type { RoomId } from "@guessthesketch/common";
import type { Room } from "../Room";

export class GlobalState {
  private constructor(private rooms = new Map<RoomId, Room>()) {}

  addRoom(roomState: Room) {
    this.rooms.set(roomState.id, roomState);
  }

  removeRoom(roomId: RoomId) {
    this.rooms.delete(roomId);
  }

  getRoomById(roomId: RoomId): Room | null {
    return this.rooms.get(roomId) ?? null;
  }

  getAllRooms() {
    return this.rooms.values();
  }

  // -----------------
  // --- Singleton ---
  // -----------------
  private static instance: GlobalState | null = null;

  static getInstance() {
    if (this.instance == null) {
      this.instance = new GlobalState();
    }
    return this.instance;
  }
}

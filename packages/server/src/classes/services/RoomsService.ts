import type { RoomId } from "@guessthesketch/common";
import type { Room } from "../Room";

// -----------------
// --- Singleton ---
// -----------------
export class RoomsService {
  private static instance: RoomsService | null = null;

  private constructor(private rooms = new Map<RoomId, Room>()) {}

  static getInstance() {
    if (this.instance == null) {
      this.instance = new RoomsService();
    }
    return this.instance;
  }

  public addRoom(roomState: Room) {
    this.rooms.set(roomState.id, roomState);
  }

  public removeRoom(roomId: RoomId) {
    this.rooms.delete(roomId);
  }

  public getRoomById(roomId: RoomId): Room | null {
    return this.rooms.get(roomId) ?? null;
  }

  public getAllRooms() {
    return this.rooms.values();
  }
}

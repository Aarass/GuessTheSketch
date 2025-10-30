import type { AuthService } from "./services/AuthService";
import type { PersistanceService } from "./services/PersitanceService";
import type { RoomsService } from "./services/RoomsService";
import type { UserService } from "./services/UserService";
import type { WordService } from "./services/WordService";

export class AppContext {
  constructor(
    public readonly roomsService: RoomsService,
    public readonly authService: AuthService,
    public readonly userService: UserService,
    public readonly wordService: WordService,
    public readonly persistanceService: PersistanceService,
  ) {}
}

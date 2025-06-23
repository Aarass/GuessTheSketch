import type { AuthService } from "./services/AuthService";
import type { PersistanceService } from "./services/PersitanceService";
import type { UserService } from "./services/UserService";
import type { WordService } from "./services/WordService";

export class AppContext {
  constructor(
    public authService: AuthService,
    public userService: UserService,
    public wordService: WordService,
    public persistanceService: PersistanceService,
  ) {}
}

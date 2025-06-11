import type { AuthService } from "./services/AuthService";
import type { UserService } from "./services/UserService";

export class AppContext {
  constructor(
    public authService: AuthService,
    public userService: UserService,
  ) {}
}

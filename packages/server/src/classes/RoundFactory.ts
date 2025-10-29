import { type RoomId, type ToolConfigs } from "@guessthesketch/common";
import type { AppContext } from "./AppContext";
import type { MessagingCenter } from "./MessagingCenter";
import { Round } from "./Round";
import { ToolStatesBuilder } from "./states/tools/ToolStatesBuilder";
import { ToolBuilder } from "./tools/ToolBuilder";

export class RoundFactory {
  private cachedToolBuilder;
  private cachedToolStatesBuilder;

  constructor(
    config: ToolConfigs,
    private ctx: AppContext,
  ) {
    this.cachedToolBuilder = new ToolBuilder(config);
    this.cachedToolStatesBuilder = new ToolStatesBuilder(config);
  }

  /**
   * Ne pozivati ako prethodna runda nije zavrsena
   */
  createRound(roomId: RoomId, messagingCenter: MessagingCenter): Round {
    const states = this.cachedToolStatesBuilder.build();
    states.setupNotifications(roomId, messagingCenter);

    // Ovo je potencijalno opasno. Ako kreiras novi round dok stari jos postoji, stari ce se prebaciti na nove state-ove.
    // Moze lako da se fiksa ali mi se ne da
    this.cachedToolBuilder.setStates(states);

    return new Round(this.ctx, this.cachedToolBuilder);
  }
}

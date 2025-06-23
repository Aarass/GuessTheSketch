import type { RoomId } from "@guessthesketch/common";
import type { GameId, RoundId } from "@guessthesketch/common/types/ids";
import { PersistanceService } from "../classes/services/PersitanceService";

const persistanceService = new PersistanceService();

setTimeout(async () => {
  const res = await persistanceService.getRoundReplay(
    "55830b75-1ac6-49c4-b90b-4885b262e1cc" as RoomId,
    "fc0e8009-e0f0-4696-b1bc-1c55f6affd6c" as GameId,
    "c1f0ba86-fb95-40f8-8f89-1568e936e971" as RoundId,
  );
  console.log(res);
}, 1000);

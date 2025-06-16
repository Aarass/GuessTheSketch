import { z } from "zod";
import { type ToolType, toolTypes } from "..";
import { PlayerIdSchema, TeamIdSchema, type TeamId } from "../types/ids";

// TODO
// dodati ogranicenja na pojedinacna polja
// npr. da duzina partije mora da bude manja od to i to

const TeamConfigSchema = z
  .object({
    name: z.string(),
    players: z.array(PlayerIdSchema),
  })
  .strict();

export type TeamConfig = z.infer<typeof TeamConfigSchema>;

const RoundsConfigSchema = z
  .object({
    cycles: z.number(),
    duration: z.number(),
  })
  .strict();

export type RoundsConfig = z.infer<typeof RoundsConfigSchema>;

const ToolConfigSchema = z
  .object({
    count: z.number(),
    consumable: z
      .object({
        maxUses: z.number(),
      })
      .optional(),
    timeoutable: z
      .object({
        useTime: z.number(),
        cooldownTime: z.number(),
      })
      .optional(),
  })
  .strict();

export type ToolConfig = z.infer<typeof ToolConfigSchema>;

export const ToolConfigsSchema = z
  .object(
    Object.fromEntries(
      toolTypes.map((type) => [type, ToolConfigSchema]),
    ) as Record<ToolType, typeof ToolConfigSchema>,
  )
  .strict();

export type ToolConfigs = z.infer<typeof ToolConfigsSchema>;

export const GameConfigSchema = z.object({
  teams: z.array(TeamConfigSchema),
  rounds: RoundsConfigSchema,
  tools: ToolConfigsSchema,
});

export type GameConfig = z.infer<typeof GameConfigSchema>;

const ProcessedGameConfigSchema = GameConfigSchema.extend({
  teams: GameConfigSchema.shape.teams.element
    .extend({
      id: TeamIdSchema,
    })
    .array(),
});
export type ProcessedGameConfig = z.infer<typeof ProcessedGameConfigSchema>;

export type ProcessedGameConfigOld = {
  teams: (TeamConfig & { id: TeamId })[];
  rounds: RoundsConfig;
  tools: ToolConfigs;
};

// type ToolConfigOld = {
//   count: number;
//   consumable?: {
//     maxUses: number;
//   };
//   timeoutable?: {
//     useTime: number;
//     cooldownTime: number;
//   };
// };

// type ToolConfigsOld = Record<ToolType, ToolConfig>;

// type RoundsConfigOld = {
//   cycles: number;
//   duration: number;
// };

// type TeamConfigOld = {
//   name: string;
//   players: PlayerId[];
// };

// type GameConfigOld = {
//   teams: TeamConfig[];
//   rounds: RoundsConfig;
//   tools: ToolConfigs;
// };

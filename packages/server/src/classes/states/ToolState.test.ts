import { expect, test } from "bun:test";
import {
  ConsumableStateComponent,
  createToolState,
  TimeoutableStateComponent,
} from "./ToolState";
import { ConsumableTool } from "../tools/Consumable";
import { Pen } from "../tools/concrete/Pen";
import type { ToolsManager } from "../ToolsManager";

test("test 1", () => {
  const state = createToolState({
    count: 1,
    consumable: {
      maxUses: 10,
    },
    timeoutable: { useTime: 10, cooldownTime: 20 },
  });

  const tcomp = state.findComponent(TimeoutableStateComponent);
  const ccomp = state.findComponent(ConsumableStateComponent);

  expect(tcomp).not.toBeNull();
  expect(ccomp).not.toBeNull();
});

test("test 2", () => {
  const state = createToolState({
    count: 1,
    timeoutable: { useTime: 10, cooldownTime: 20 },
  });

  const tcomp = state.findComponent(TimeoutableStateComponent);
  const ccomp = state.findComponent(ConsumableStateComponent);

  expect(tcomp).not.toBeNull();
  expect(ccomp).toBeNull();
});

test("test 3", () => {
  const state = createToolState({
    count: 1,
    consumable: {
      maxUses: 10,
    },
    timeoutable: { useTime: 10, cooldownTime: 20 },
  });

  console.log(state.getState());

  state.findComponent(ConsumableStateComponent)!.set((s) => ({
    timesUsed: s.timesUsed + 1,
  }));

  console.log(state.getState());

  state.findComponent(TimeoutableStateComponent)!.set((s) => ({
    cooldowns: [...s.cooldowns, 10],
  }));

  console.log(state.getState());
});

test.only("test 4", () => {
  const tool = new ConsumableTool(
    new ConsumableTool(new Pen({} as ToolsManager), 2),
    2,
  );

  tool.getDrawing({
    type: "line",
  });
});

import type {
  Drawing,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { Tool } from "./Tool";
import { TimeoutableStateComponent } from "../states/tools/TimeoutableState";
import { assert } from "../../utility/dbg";
import { ToolDeactivatedEvent } from "./events/ToolEvent";

// -----------------
// --- Decorator ---
// -----------------
export class TimeoutableTool extends Tool {
  toolType: ToolType;

  useCountdown: NodeJS.Timeout | null = null;
  useTimeout: NodeJS.Timeout | null = null;

  constructor(
    private wrappee: Tool,
    private useTime: number,
    private cooldownTime: number,
  ) {
    super(wrappee.state, wrappee.id);

    this.toolType = this.wrappee.toolType;
  }

  override init() {
    this.wrappee.init();

    const comp = this.state.findComponent(TimeoutableStateComponent);
    assert(comp);

    // Postavi pocetno preostalo vreme koriscenja
    comp.set((s) => {
      const newTimers = [...s.timers];
      newTimers.push({
        toolId: this.id,
        leftUseTime: this.useTime / 1000,
        leftCooldownTime: -1,
      });

      return {
        timers: newTimers,
      };
    });

    // Otpocni odbrojavanje
    this.useCountdown = setInterval(() => {
      comp.set((state) => {
        return {
          timers: state.timers.map((timer) => {
            return timer.toolId !== this.id
              ? timer
              : {
                  ...timer,
                  leftUseTime: timer.leftUseTime - 1,
                };
          }),
        };
      });
    }, 1000);

    // Otpocni pravi timeout
    this.useTimeout = setTimeout(() => {
      clearInterval(this.useCountdown!);
      this.emit(new ToolDeactivatedEvent());

      this.startCooldown();
    }, this.useTime);
  }

  startCooldown() {
    const comp = this.state.findComponent(TimeoutableStateComponent);
    assert(comp);
    // Postavi pocetni cooldown
    comp.set((state) => {
      return {
        timers: state.timers.map((timer) => {
          return timer.toolId !== this.id
            ? timer
            : {
                ...timer,
                leftUseTime: 0,
                leftCooldownTime: this.cooldownTime / 1000,
              };
        }),
      };
    });

    // Otpocni odbrojavanje
    const cooldownCountdown = setInterval(() => {
      comp.set((state) => {
        return {
          timers: state.timers.map((timer) => {
            return timer.toolId !== this.id
              ? timer
              : {
                  ...timer,
                  leftCooldownTime: timer.leftCooldownTime - 1,
                };
          }),
        };
      });
    }, 1000);

    // Otpocni pravi cooldown
    setTimeout(() => {
      clearInterval(cooldownCountdown);
      this.wrappee.releaseResources();

      comp.set((state) => ({
        timers: state.timers.filter((timer) => timer.toolId !== this.id),
      }));
    }, this.cooldownTime);
  }

  override cancelWork(): void {
    if (this.useCountdown) {
      clearInterval(this.useCountdown);
    }

    if (this.useTimeout) {
      clearInterval(this.useTimeout);
      this.startCooldown();
    }
  }

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return this.wrappee.getDrawing(drawing);
  }

  override use(drawing: UnvalidatedNewDrawingWithType) {
    return this.wrappee.use(drawing);
  }

  override releaseResources() {}
}

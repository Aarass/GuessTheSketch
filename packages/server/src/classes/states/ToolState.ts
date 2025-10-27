import type { ToolConfig } from "@guessthesketch/common";

export class ToolState {
  constructor(
    public toolsLeft: number,
    public components: ToolStateComponent[] = [],
  ) {}

  findComponent<T>(constructor: new (...args: any[]) => T): T | null {
    const component = this.components.find((x) => x instanceof constructor);
    if (component) {
      return component as T;
    } else {
      return null;
    }
  }

  getState(): object {
    return Object.assign(
      {
        toolsLeft: this.toolsLeft,
      },
      ...this.components.map((c) => c.getState()),
    );
  }
}

export abstract class ToolStateComponent {
  abstract getState(): object;
}

interface ConsumableState {
  timesUsed: number;
}

export class ConsumableStateComponent extends ToolStateComponent {
  constructor(
    public state: ConsumableState = {
      timesUsed: 0,
    },
  ) {
    super();
  }

  set(cb: (_: ConsumableState) => ConsumableState): void {
    this.state = cb(this.state);
  }

  getState(): object {
    return this.state;
  }
}

interface TimeoutableState {
  cooldowns: number[];
}

export class TimeoutableStateComponent extends ToolStateComponent {
  constructor(
    public state: TimeoutableState = {
      cooldowns: [],
    },
  ) {
    super();
  }

  set(cb: (_: TimeoutableState) => TimeoutableState): void {
    this.state = cb(this.state);
  }

  getState(): object {
    return this.state;
  }
}

export function createToolState(config: ToolConfig) {
  const components = [];

  if (config.consumable) {
    components.push(new ConsumableStateComponent());
  }

  if (config.timeoutable) {
    components.push(new TimeoutableStateComponent());
  }

  return new ToolState(config.count, components);
}

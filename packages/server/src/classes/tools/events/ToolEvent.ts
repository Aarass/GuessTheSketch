export abstract class ToolEvent {
  public abstract readonly type: ToolEventType;
}

export enum ToolEventType {
  ToolDeactivated,
}

export class ToolDeactivatedEvent extends ToolEvent {
  static readonly type = ToolEventType.ToolDeactivated;
  public readonly type = ToolDeactivatedEvent.type;
}

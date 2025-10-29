type OnChange = () => any;

export abstract class ToolStateComponent<T extends object = object> {
  private notifyChange!: OnChange;

  constructor(protected state: T) {}

  public set(cb: (_: T) => T): void {
    this.state = cb(this.state);
    this.notifyChange();
  }

  public getState(): T {
    return this.state;
  }

  public getUserReadyState(): object {
    return this.getState();
  }

  public setOnChangeCB(cb: OnChange) {
    this.notifyChange = cb;
  }
}

import { Signal, WritableSignal, signal } from "@angular/core";

export class BaseStateService<T> {

  public stateSignal: Signal<T>;

  protected _state: WritableSignal<T>;

  constructor(initialValue: T) {
    this._state = signal(initialValue);
    this.stateSignal = this._state.asReadonly();
  }

  public get state(): T {
    return this._state();
  }

  public set(key: keyof T, value: T[keyof T]): void {
    this._state.set({ ...this.state, [key]: value });
  }

  public get(key: keyof T): T[keyof T] {
    return this.state[key];
  }

  public updateState(partial: Partial<T>): void {
    this._state.set({ ...this.state, ...partial });
  }

}
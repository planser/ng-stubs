import { ControlValueAccessors } from "./control-value-accessors";
import { ControlValueAccessorStub } from "./control-value-accessor-stub";
import { Predicate, DebugElement } from "@angular/core";

export class StubbedComponent<T> {

  constructor(readonly instances: T[], readonly type: any, private controlValueAccessors: ControlValueAccessors) { }

  public get instance(): T {
    if (this.instances.length == 0) throw new Error("No instance created yet.");
    if (this.instances.length > 1) throw new Error("Multiple instances available. Use the indices property instead.");
    return this.instances[0] as T;
  }

  public get mostRecent(): T {
    if (this.instances.length == 0) throw new Error("No instance created yet.");
    return this.instances[this.instances.length - 1] as T;
  }

  public controlValueAccessorFor(component: T): ControlValueAccessorStub {
    return this.controlValueAccessors.get(component);
  }

  public get controlValueAccessor(): ControlValueAccessorStub {
    return this.controlValueAccessors.get(this.instance);
  }

  public query(predicate: Predicate<DebugElement>, context: DebugElement): T {
    const result = context.query(predicate);
    return result ? result.componentInstance : null;
  }

  public queryAll(predicate: Predicate<DebugElement>, context: DebugElement): T[] {
    return context.queryAll(predicate).map(e => e.componentInstance);
  }

}
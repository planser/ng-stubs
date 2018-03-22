import { ControlValueAccessorStub } from "./control-value-accessor-stub";

export class ControlValueAccessors {

  private instances = {}

  public get(component: any, create?: boolean): ControlValueAccessorStub | null {
    let result = this.instances[component.__index];
    if (result == null && create) {
      result = new ControlValueAccessorStub();
      this.instances[component.__index] = result;
    }

    return result;
  }

  public destroy(component: any): void {
    delete this.instances[component.__index];
  }

}
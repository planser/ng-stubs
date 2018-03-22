import { ControlValueAccessor } from "@angular/forms";
import { createSpy } from "./util";

export class ControlValueAccessorStub implements ControlValueAccessor {

  private __fn: any;

  constructor() {
    this.writeValue = createSpy();
    this.setDisabledState = createSpy();
  }

  writeValue(obj: any): void {
  }

  registerOnChange(fn: any): void {
    this.__fn = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  propagateValue(obj: any): void {
    if (this.__fn) this.__fn(obj);
  }

}
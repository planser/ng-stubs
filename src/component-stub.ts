import { StubbedComponent } from './stubbed-component';
import { ControlValueAccessors } from './control-value-accessors';
import { StubOptions } from './stub-options';
import { annotationFor, inputAnnotationsBindingsFor, outputAnnotationsBindingsFor, inputPropMetadataBindingsFor, outputPropMetadataBindingsFor, providesNgValueAccessor, isComponent, isFunction, createSpy } from './util';
import { Type, Component, forwardRef, Injectable, OnDestroy, ElementRef, Input, Output, EventEmitter, Directive } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export function ComponentStub<T>(component: Type<T>, stubOptions?: StubOptions): StubbedComponent<T> {
  stubOptions = {
    template: "<ng-content></ng-content>",
    ...stubOptions
  }

  const annotation = annotationFor(component);
  if (annotation == null) throw new Error("Given type is neither a component nor a directive");

  const inputAnnotationsBindings = inputAnnotationsBindingsFor(component, annotation);
  const inputPropMetadataBindings = inputPropMetadataBindingsFor(component, annotation);

  const outputAnnotationsBindings = outputAnnotationsBindingsFor(component, annotation);
  const outputPropMetadataBindings = outputPropMetadataBindingsFor(component, annotation);

  const metadata: Component = {
    template: stubOptions ? (stubOptions.template || component.name) : component.name,
    selector: annotation.selector,
    inputs: inputAnnotationsBindings,
    outputs: outputAnnotationsBindings,
    exportAs: annotation.exportAs
  }

  const controlValueAccessors = new ControlValueAccessors();

  if (providesNgValueAccessor(annotation)) {
    metadata["providers"] = [{
      provide: NG_VALUE_ACCESSOR,
      useFactory: comp => controlValueAccessors.get(comp, true),
      deps: [forwardRef(() => Comp)],
      multi: true
    }]
  }

  const instances = [];

  @Injectable()
  class Comp implements OnDestroy {

    private __index: number;

    constructor(/*private __elementRef: ElementRef*/) {
      this.__index = instances.length;
      instances.push(this);
    }

    ngOnDestroy(): void {
      controlValueAccessors.destroy(this);
      instances.splice(this.__index, 1);
    }

  }

  inputPropMetadataBindings.forEach(i => { Input(i.templateName)(Comp.prototype, i.propName) });
  outputPropMetadataBindings.forEach(i => { Output(i.templateName)(Comp.prototype, i.propName) });

  [...outputAnnotationsBindings, ...(outputPropMetadataBindings.map(p => p.propName))].forEach((propName: string) => {
    Object.defineProperty(Comp.prototype, propName, {
      get: function() {
        if (this["_" + propName] == null) this["_" + propName] = new EventEmitter();
        return this["_" + propName];
      }
    });
  });

  // TODO: Test - eg parent component calls method on child component
  Object.keys(component.prototype)
    .filter(p => p != "constructor")
    // TODO: what happens with inherited functions?
    .filter(p => isFunction(component.prototype[p]))
    .filter(p => Comp.prototype.hasOwnProperty(p) == false)
    // TODO: install spy instead of empty function
    .forEach(p => { Comp.prototype[p] = createSpy() });

  return new StubbedComponent(instances, isComponent(annotation) ? Component(metadata)(Comp) : Directive(metadata)(Comp), controlValueAccessors);
}
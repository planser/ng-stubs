import { StubbedComponent } from './stubbed-component';
import { ControlValueAccessors } from './control-value-accessors';
import { StubOptions } from './stub-options';
import {
    annotationFor,
    contentChildPropMetadataQueriesFor,
    contentChildrenPropMetadataQueriesFor,
    inputAnnotationsBindingsFor,
    inputPropMetadataBindingsFor,
    isComponent,
    outputAnnotationsBindingsFor,
    outputPropMetadataBindingsFor,
    providesNgValueAccessor,
    spyOnMethod, isMethod
} from './util';
import {
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnDestroy,
    Output,
    Type
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export function ComponentStub<T>(component: Type<T>, stubOptions?: StubOptions): StubbedComponent<T> {
  stubOptions = {
    template: "<ng-content></ng-content>",
    ...stubOptions
  }

  const annotation = annotationFor(component);
  if (annotation == null) throw new Error("Given type is neither a component nor a directive");

  const inputAnnotationsBindings = inputAnnotationsBindingsFor(component, annotation);
  const inputPropMetadataBindings = inputPropMetadataBindingsFor(component);

  const outputAnnotationsBindings = outputAnnotationsBindingsFor(component, annotation);
  const outputPropMetadataBindings = outputPropMetadataBindingsFor(component);

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

  class Comp implements OnDestroy {

    private __index: number;

    constructor(@Inject(ElementRef) private __elementRef: ElementRef) {
      this.__index = instances.length;
      instances.push(this);
    }

    ngOnDestroy(): void {
      controlValueAccessors.destroy(this);
      instances.splice(this.__index, 1);
    }

  }

  inputPropMetadataBindings.forEach(i => Input(i.templateName)(Comp.prototype, i.propName));
  outputPropMetadataBindings.forEach(i => Output(i.templateName)(Comp.prototype, i.propName));

  [...outputAnnotationsBindings, ...(outputPropMetadataBindings.map(p => p.propName))].forEach((propName: string) => {
    Object.defineProperty(Comp.prototype, propName, {
      get: function() {
        if (this["_" + propName] == null) this["_" + propName] = new EventEmitter();
        return this["_" + propName];
      }
    });
  });

  contentChildPropMetadataQueriesFor(component).forEach(q => ContentChild(q.query.selector, { read: q.query.read, static: q.query.static })(Comp.prototype, q.propName));
  contentChildrenPropMetadataQueriesFor(component).forEach(q => ContentChildren(q.query.selector, { read: q.query.read })(Comp.prototype, q.propName));

  Object.getOwnPropertyNames(component.prototype)
    .filter(p => p != "constructor")
    .filter(p => Comp.prototype.hasOwnProperty(p) == false)
    .forEach(p => {;
        if (isMethod(component.prototype, p)) {
            // Is it correct to use the prototype here?
            // What happens eg if we have 2 instances, for instance 1 something is called and I check to have been called on instance 2?
            spyOnMethod(Comp.prototype, p);
        }
    });

  return new StubbedComponent(instances, isComponent(annotation) ? Component(metadata)(Comp) : Directive(metadata)(Comp), controlValueAccessors);
}

import { ɵReflectionCapabilities, Type } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export interface Binding {
  propName: string;
  templateName: string;
}

export function isDirective(a: any): boolean {
  return a.ngMetadataName == "Directive";
}

export function isComponent(a: any): boolean {
  return a.ngMetadataName == "Component";
}

export function isFunction(param): boolean {
  return param != null && {}.toString.call(param) === '[object Function]';
}

export function annotationFor(component: Type<any>): any {
  return new ɵReflectionCapabilities().annotations(component).find(a => isDirective(a) || isComponent(a));
}

export function propMetadataBindingsFor(component: Type<any>, ngMetadataName: "Input" | "Output"): Binding[] {
  const metaData: any = new ɵReflectionCapabilities().propMetadata(component);
  return Object.keys(metaData)
    .map(key => [key, metaData[key].find(e => e.ngMetadataName == ngMetadataName)])
    .filter(e => e[1] != null)
    .map(e => ({ propName: e[0], templateName: e[1].bindingPropertyName ? e[1].bindingPropertyName : e[0] }));
}

export function annotationBindingsFor(component: Type<any>, annotation: any, annotationKey: "inputs" | "outputs"): string[] {
  return annotation == null ? [] : (annotation[annotationKey] ? annotation[annotationKey] : []);
}

export function inputAnnotationsBindingsFor(component: Type<any>, annotation: any): string[] {
  return annotationBindingsFor(component, annotation, "inputs");
}

export function outputAnnotationsBindingsFor(component: Type<any>, annotation: any): string[] {
  return annotationBindingsFor(component, annotation, "outputs");
}

export function inputPropMetadataBindingsFor(component: Type<any>, annotation: any): Binding[] {
  return propMetadataBindingsFor(component, "Input")
}

export function outputPropMetadataBindingsFor(component: Type<any>, annotation: any): Binding[] {
  return propMetadataBindingsFor(component, "Output")
}

export function providesNgValueAccessor(annotation: any): boolean {
  return annotation.providers ? annotation.providers.find(p => p.provide === NG_VALUE_ACCESSOR) != null : false;
}

export function createSpy(): () => any {
  return (<any>window).ngStubsCreateSpy ? (<any>window).ngStubsCreateSpy() : jasmine.createSpy();
}
import { Component, EventEmitter, Input, Output, Directive, forwardRef, OnDestroy } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from "@angular/forms";
import { async, TestBed, ComponentFixture } from "@angular/core/testing";
import { ComponentStub } from "../src/component-stub";
import { StubbedComponent } from "../src/stubbed-component";

@Directive({
    selector: "[appNoInputs]"
})
class NoInputsDirective { }

@Directive({
    selector: "[appInputs]",
    inputs: ["annotationInput"]
})
class InputsDirective {
    @Input()
    simpleInput: string;
    @Input("appInputs")
    aliasedInput: string;
}

@Component({
    selector: "app-root",
    template: `
        <div appNoInputs></div>
        <div [appInputs]="'a-value'" [simpleInput]="'b-value'" [annotationInput]="'c-value'"></div>
    `
})
class AppComponent {
}

describe("ng-stubs - directives", () => {

    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    let noInputsDirectiveStub: StubbedComponent<NoInputsDirective>;
    let inputsDirectiveStub: StubbedComponent<InputsDirective>;

    beforeEach(async(() => {
        noInputsDirectiveStub = ComponentStub(NoInputsDirective);
        inputsDirectiveStub = ComponentStub(InputsDirective);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [
                noInputsDirectiveStub.type,
                inputsDirectiveStub.type,
                AppComponent
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("supports directives without inputs", () => {
        expect(noInputsDirectiveStub.instances).toBeDefined();
    });

    it("supports directives having inputs", () => {
        expect(inputsDirectiveStub.instance.simpleInput).toEqual("b-value");
        expect(inputsDirectiveStub.instance.aliasedInput).toEqual("a-value");
        expect(inputsDirectiveStub.instance["annotationInput"]).toEqual("c-value");
    });

});
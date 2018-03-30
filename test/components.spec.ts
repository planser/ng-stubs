import { Component, EventEmitter, forwardRef, Input, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { StubbedComponent } from "../src/stubbed-component";
import { ComponentStub } from "../src/component-stub";

@Component({
    selector: "app-no-inputs-no-outputs",
    template: "<div></div>"
})
class NoInputsNoOutputsComponent { }

@Component({
    selector: "app-inputs-and-outputs",
    template: "<div></div>",
    inputs: ["annotationInput"],
    outputs: ["annotationOutput"]
})
class InputsAndOutputsComponent {

    @Input()
    simpleInput: string;
    @Input("aliasIn")
    aliasedInput: string;

    @Output()
    simpleOutput: EventEmitter<string>;
    @Output("aliasOut")
    aliasedOutput: EventEmitter<string>;

}

@Component({
    selector: "app-control-value-accessor",
    template: "<div></div>",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ControlValueAccessorComponent),
            multi: true
        }
    ]
})
class ControlValueAccessorComponent implements ControlValueAccessor {

    writeValue(obj: any): void {
    }
    registerOnChange(fn: any): void {
    }
    registerOnTouched(fn: any): void {
    }
    setDisabledState?(isDisabled: boolean): void {
    }

}

@Component({
    selector: "app-multiple-instances",
    template: "<div></div>"
})
class MultipleInstancesComponent {

    @Input()
    anInput: string;

}

@Component({
    selector: "app-referenced",
    template: "<div></div>"
})
class ReferencedComponent {

    public aMethod(param: string): void {
    }

}

@Component({
    selector: "app-root",
    template: `
        <app-no-inputs-no-outputs class="a-class"></app-no-inputs-no-outputs>
        <app-inputs-and-outputs [simpleInput]="'a-value'" [aliasIn]="'b-value'" [annotationInput]="'c-value'" (simpleOutput)="onOne($event)" (aliasOut)="onTwo($event)" (annotationOutput)="onThree($event)"></app-inputs-and-outputs>
        <app-control-value-accessor [ngModel]="model" (ngModelChange)="onModelChange($event)"></app-control-value-accessor>
        <app-multiple-instances [anInput]="'anInputA1'" class="a-class"></app-multiple-instances>
        <app-multiple-instances [anInput]="'anInputB1'" class="b-class"></app-multiple-instances>
        <app-multiple-instances [anInput]="'anInputA2'" class="a-class"></app-multiple-instances>
        <app-referenced #ref></app-referenced>
    `
})
class AppComponent {

    @ViewChild("ref")
    referencedComponent: ReferencedComponent;

    model: string;

    onOne = jest.fn();
    onTwo = jest.fn();
    onThree = jest.fn()

    onModelChange = jest.fn();

    callAMethodOnReferencedComponent(param: string): void {
        this.referencedComponent.aMethod(param);
    }

}

describe("ng-stubs - components ", () => {

    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    let noInputsNoOutputsComponentStub: StubbedComponent<NoInputsNoOutputsComponent>;
    let inputsAndOutputsComponentStub: StubbedComponent<InputsAndOutputsComponent>;
    let controlValueAccessorComponentStub: StubbedComponent<ControlValueAccessorComponent>;
    let multipleInstancesComponentStub: StubbedComponent<MultipleInstancesComponent>;
    let referencedComponentStub: StubbedComponent<ReferencedComponent>;

    beforeEach(async(() => {
        noInputsNoOutputsComponentStub = ComponentStub(NoInputsNoOutputsComponent);
        inputsAndOutputsComponentStub = ComponentStub(InputsAndOutputsComponent);
        controlValueAccessorComponentStub = ComponentStub(ControlValueAccessorComponent);
        multipleInstancesComponentStub = ComponentStub(MultipleInstancesComponent);
        referencedComponentStub = ComponentStub(ReferencedComponent);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [
                noInputsNoOutputsComponentStub.type,
                inputsAndOutputsComponentStub.type,
                controlValueAccessorComponentStub.type,
                multipleInstancesComponentStub.type,
                referencedComponentStub.type,
                AppComponent
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("supports components without inputs and outputs", () => {
        expect(noInputsNoOutputsComponentStub.instance).toBeDefined();
    });

    it("supports components having inputs", () => {
        expect(inputsAndOutputsComponentStub.instance.simpleInput).toEqual("a-value");
        expect(inputsAndOutputsComponentStub.instance.aliasedInput).toEqual("b-value");
        expect(inputsAndOutputsComponentStub.instance["annotationInput"]).toEqual("c-value");
    });

    it("supports components having outputs", () => {
        inputsAndOutputsComponentStub.instance.simpleOutput.emit("one");
        expect(component.onOne).toHaveBeenCalledWith("one");

        inputsAndOutputsComponentStub.instance.aliasedOutput.emit("two");
        expect(component.onTwo).toHaveBeenCalledWith("two");

        inputsAndOutputsComponentStub.instance["annotationOutput"].emit("three");
        expect(component.onThree).toHaveBeenCalledWith("three");
    });

    it("supports components providing a control value accessor", async(() => {
        component.model = "this is the model";
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(controlValueAccessorComponentStub.controlValueAccessor.writeValue).toHaveBeenCalledWith("this is the model");

            controlValueAccessorComponentStub.controlValueAccessor.propagateValue("changed model");
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(component.onModelChange).toHaveBeenCalledWith("changed model");
            });
        });
    }));

    it("supports spying on any method", () => {
        component.callAMethodOnReferencedComponent("aParam");
        expect(referencedComponentStub.instance.aMethod).toHaveBeenCalledWith("aParam");
    });

    it("supports querying a single instance", () => {
        expect(multipleInstancesComponentStub.query(By.css("app-multiple-instances.does-not-exist"), fixture.debugElement)).toBeNull();

        const aInstance = multipleInstancesComponentStub.query(By.css("app-multiple-instances.a-class"), fixture.debugElement);
        expect(aInstance.anInput).toEqual("anInputA1");

        const bInstance = multipleInstancesComponentStub.query(By.css("app-multiple-instances.b-class"), fixture.debugElement);
        expect(bInstance.anInput).toEqual("anInputB1");
    });

    it("supports querying multiple instances", () => {
        expect(multipleInstancesComponentStub.queryAll(By.css("app-multiple-instances.does-not-exist"), fixture.debugElement)).toEqual([]);
        expect(multipleInstancesComponentStub.instances.length).toEqual(3);

        const aInstances = multipleInstancesComponentStub.queryAll(By.css("app-multiple-instances.a-class"), fixture.debugElement);
        expect(aInstances.length).toEqual(2);
        expect(aInstances[0].anInput).toEqual("anInputA1");
        expect(aInstances[1].anInput).toEqual("anInputA2");

        const bInstances = multipleInstancesComponentStub.queryAll(By.css("app-multiple-instances.b-class"), fixture.debugElement);
        expect(bInstances.length).toEqual(1);
        expect(bInstances[0].anInput).toEqual("anInputB1");
    });

});
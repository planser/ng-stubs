import { Component, Input, Output, EventEmitter, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from "@angular/forms";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
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
    selector: "app-root",
    template: `
        <app-no-inputs-no-outputs class="a-class"></app-no-inputs-no-outputs>
        <app-inputs-and-outputs [simpleInput]="'a-value'" [aliasIn]="'b-value'" [annotationInput]="'c-value'" (simpleOutput)="onOne($event)" (aliasOut)="onTwo($event)" (annotationOutput)="onThree($event)"></app-inputs-and-outputs>
        <app-control-value-accessor [ngModel]="model" (ngModelChange)="onModelChange($event)"></app-control-value-accessor>
        <app-multiple-instances [anInput]="'anInputA1'" class="a-class"></app-multiple-instances>
        <app-multiple-instances [anInput]="'anInputB1'" class="b-class"></app-multiple-instances>
        <app-multiple-instances [anInput]="'anInputA2'" class="a-class"></app-multiple-instances>
    `
})
class AppComponent {
    model: string;

    onOne(event: string): void { }
    onTwo(event: string): void { }
    onThree(event: string): void { }

    onModelChange(event: string): void { }
}

describe("ng-stubs - components ", () => {

    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    let noInputsNoOutputsComponentStub: StubbedComponent<NoInputsNoOutputsComponent>;
    let inputsAndOutputsComponentStub: StubbedComponent<InputsAndOutputsComponent>;
    let controlValueAccessorComponentStub: StubbedComponent<ControlValueAccessorComponent>;
    let multipleInstancesComponentStub: StubbedComponent<MultipleInstancesComponent>;

    beforeEach(async(() => {
        noInputsNoOutputsComponentStub = ComponentStub(NoInputsNoOutputsComponent);
        inputsAndOutputsComponentStub = ComponentStub(InputsAndOutputsComponent);
        controlValueAccessorComponentStub = ComponentStub(ControlValueAccessorComponent);
        multipleInstancesComponentStub = ComponentStub(MultipleInstancesComponent);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [
                noInputsNoOutputsComponentStub.type,
                inputsAndOutputsComponentStub.type,
                controlValueAccessorComponentStub.type,
                multipleInstancesComponentStub.type,
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
        component.onOne = jest.fn();
        inputsAndOutputsComponentStub.instance.simpleOutput.emit("one");
        expect(component.onOne).toHaveBeenCalledWith("one");

        component.onTwo = jest.fn();
        inputsAndOutputsComponentStub.instance.aliasedOutput.emit("two");
        expect(component.onTwo).toHaveBeenCalledWith("two");

        component.onThree = jest.fn();
        inputsAndOutputsComponentStub.instance["annotationOutput"].emit("three");
        expect(component.onThree).toHaveBeenCalledWith("three");
    });

    it("supports components providing a control value accessor", async(() => {
        controlValueAccessorComponentStub.instance.writeValue = jest.fn();
        component.model = "this is the model";
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(controlValueAccessorComponentStub.controlValueAccessor.writeValue).toHaveBeenCalledWith("this is the model");

            component.onModelChange = jest.fn();
            controlValueAccessorComponentStub.controlValueAccessor.propagateValue("changed model");
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(component.onModelChange).toHaveBeenCalledWith("changed model");
            });
        });
    }));

    /*
    it("supports getting instances by css class", () => {
        expect(multipleInstancesComponentStub.instances.length).toEqual(3);

        const aInstances = multipleInstancesComponentStub.byClass("a-class");
        expect(aInstances.length).toEqual(2);
        expect(aInstances[0].anInput).toEqual("anInputA1");
        expect(aInstances[1].anInput).toEqual("anInputA2");

        const bInstances = multipleInstancesComponentStub.byClass("b-class");
        expect(bInstances.length).toEqual(1);
        expect(bInstances[0].anInput).toEqual("anInputB1");
    });
    */

});
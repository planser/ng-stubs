[![Build Status](https://travis-ci.org/planser/ng-stubs.svg?branch=master)](https://travis-ci.org/planser/ng-stubs)

# ng-stubs
Create stubs for your Angular components and directives dynamically.

## Installation

npm install --save-dev https://github.com/planser/ng-stubs.git

## Example Usage

```typescript
import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-greeter',
  template: '<button (click)="onClick()">Say Hi</button>',
  styleUrls: ['./greeter.component.css']
})
export class GreeterComponent {

  @Input()
  name: string;
  @Output()
  greet = new EventEmitter<string>();

  onClick(): void {
    this.greet.emit(`Hi, ${this.name}`);
  }

}

```

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div><app-greeter [name]="name" (greet)="onGreet($event)"></app-greeter></div>
    <div class="result">{{greeting}}</div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  name = "A Name";
  greeting: string;

  onGreet(greeting: string): void {
    this.greeting = greeting;
  }

}

```

```typescript
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { StubbedComponent, ComponentStub } from 'ng-stubs';
import { AppComponent } from './app.component';
import { GreeterComponent } from './greeter/greeter.component';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {

  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  let greeterComponentStub: StubbedComponent<GreeterComponent>;

  beforeEach(async(() => {
    greeterComponentStub = ComponentStub(GreeterComponent)

    TestBed.configureTestingModule({
      declarations:
      [
        AppComponent,
        greeterComponentStub.type
      ]
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('binds the name to the greeter', () => {
    expect(greeterComponentStub.instance.name).toEqual(app.name);

    app.name = "Tester";
    fixture.detectChanges();

    expect(greeterComponentStub.instance.name).toEqual("Tester");
  });

  it('shows the greeter`s result', () => {
    greeterComponentStub.instance.greet.emit("Hi, Tester");
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css(".result")).nativeElement.textContent).toEqual("Hi, Tester");
  });

});
```

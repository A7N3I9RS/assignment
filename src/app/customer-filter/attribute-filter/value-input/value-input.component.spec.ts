import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueInputComponent } from './value-input.component';
import { AttributeFilter } from '../../models';

function createInputEvent(value: string): Event {
  const input = document.createElement('input');
  input.value = value;
  const event = new Event('input');
  Object.defineProperty(event, 'target', { value: input, enumerable: true });
  return event;
}

describe('ValueInputComponent', () => {
  let fixture: ComponentFixture<ValueInputComponent>;
  let component: ValueInputComponent;

  const baseAttribute: AttributeFilter = {
    id: 1,
    property: 'status',
    propertyType: 'string',
    operator: 'equals',
    value: undefined
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValueInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ValueInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('attribute', baseAttribute);
    fixture.detectChanges();
  });

  it('should expose the current single value when it is a primitive', () => {
    expect(component.singleValue()).toBeUndefined();

    const updated: AttributeFilter = {
      ...baseAttribute,
      value: 'confirmed'
    };

    fixture.componentRef.setInput('attribute', updated);
    fixture.detectChanges();

    expect(component.singleValue()).toBe('confirmed');
  });

  it('should emit sanitized numeric values for number inputs', () => {
    const emitted: unknown[] = [];
    component.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentRef.setInput('inputType', 'number');
    fixture.detectChanges();

    component.onSingleValueChange(createInputEvent('45'));
    component.onSingleValueChange(createInputEvent('abc'));
    component.onSingleValueChange(createInputEvent(''));

    expect(emitted).toEqual([45, undefined, undefined]);
  });

  it('should emit range values with normalized boundaries', () => {
    const emitted: unknown[] = [];
    component.valueChange.subscribe((value) => emitted.push(value));

    const withRange: AttributeFilter = {
      ...baseAttribute,
      operator: 'between',
      value: { from: 3, to: 7 }
    };

    fixture.componentRef.setInput('attribute', withRange);
    fixture.detectChanges();

    component.onRangeChange('from', createInputEvent('10'));
    component.onRangeChange('to', createInputEvent(''));

    expect(emitted).toEqual([
      { from: 10, to: 7 },
      { from: 3, to: null }
    ]);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeFilterComponent } from './attribute-filter.component';
import { AttributeFilter } from '../models';

const AVAILABLE_ATTRIBUTES = [
  { property: 'email', type: 'string' as const },
  { property: 'age', type: 'number' as const }
];

function createAttribute(overrides: Partial<AttributeFilter> = {}): AttributeFilter {
  return {
    id: 1,
    ...overrides
  };
}

function createInputEvent(value: string): Event {
  const input = document.createElement('input');
  input.value = value;
  const event = new Event('input');
  Object.defineProperty(event, 'target', { value: input, enumerable: true });
  return event;
}

describe('AttributeFilterComponent', () => {
  let fixture: ComponentFixture<AttributeFilterComponent>;
  let component: AttributeFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AttributeFilterComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('availableAttributes', AVAILABLE_ATTRIBUTES);
    fixture.componentRef.setInput('attribute', createAttribute());
    fixture.detectChanges();
  });

  it('should synchronize the property control with attribute changes and clear unavailable selections', () => {
    const control = component.attributeControl;

    const emailAttribute = createAttribute({ property: 'email' });
    fixture.componentRef.setInput('attribute', emailAttribute);
    fixture.detectChanges();
    expect(control.value).toBe('email');

    const ageAttribute = createAttribute({ property: 'age', propertyType: 'number' });
    fixture.componentRef.setInput('attribute', ageAttribute);
    fixture.detectChanges();
    expect(control.value).toBe('age');

    fixture.componentRef.setInput('availableAttributes', [AVAILABLE_ATTRIBUTES[0]]);
    fixture.detectChanges();
    expect(control.value).toBe('');
  });

  it('should emit property updates and clear the selection when requested', () => {
    const propertySpy = jasmine.createSpy('propertyChange');
    component.propertyChange.subscribe(propertySpy);

    component.onAttributeSelected('email');
    expect(propertySpy).toHaveBeenCalledWith('email');

    component.clearAttribute();
    expect(propertySpy).toHaveBeenCalledWith(undefined);

    expect(component.attributeControl.value).toBe('');
  });

  it('should sanitize emitted values for single value and range operators', () => {
    const emitted: unknown[] = [];
    component.valueChange.subscribe((value) => {
      emitted.push(
        typeof value === 'object' && value !== null && !Array.isArray(value)
          ? { ...(value as Record<string, unknown>) }
          : value
      );
      const current = component.attribute();
      fixture.componentRef.setInput('attribute', { ...current, value });
      fixture.detectChanges();
    });

    fixture.componentRef.setInput('attribute', createAttribute({ propertyType: 'number', operator: 'greaterThan' }));
    fixture.detectChanges();
    component.onSingleValueChange(createInputEvent('123'));
    component.onSingleValueChange(createInputEvent('abc'));
    component.onSingleValueChange(createInputEvent(''));

    fixture.componentRef.setInput(
      'attribute',
      createAttribute({
        propertyType: 'number',
        operator: 'between',
        value: { from: 5, to: 7 }
      })
    );
    fixture.detectChanges();
    component.onRangeChange('from', createInputEvent('10'));
    component.onRangeChange('to', createInputEvent(''));

    expect(emitted).toEqual([
      123,
      undefined,
      undefined,
      { from: 10, to: 7 },
      { from: 10, to: null }
    ]);
  });
});

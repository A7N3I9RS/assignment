import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';

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

describe('AttributeFilterComponent', () => {
  let fixture: ComponentFixture<AttributeFilterComponent>;
  let component: AttributeFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AttributeFilterComponent);
    component = fixture.componentInstance;
    component.availableAttributes = AVAILABLE_ATTRIBUTES;
    component.attribute = createAttribute();
    component.ngOnChanges({ attribute: new SimpleChange(undefined, component.attribute, true) });
    fixture.detectChanges();
  });

  it('should synchronize the property control with attribute changes and clear unavailable selections', () => {
    const control = (component as any).attributeControl as { value: string };

    const emailAttribute = createAttribute({ property: 'email' });
    component.attribute = emailAttribute;
    component.ngOnChanges({ attribute: new SimpleChange(null, emailAttribute, true) });
    expect(control.value).toBe('email');

    const ageAttribute = createAttribute({ property: 'age', propertyType: 'number' });
    component.attribute = ageAttribute;
    component.ngOnChanges({ attribute: new SimpleChange(emailAttribute, ageAttribute, false) });
    expect(control.value).toBe('age');

    component.availableAttributes = [AVAILABLE_ATTRIBUTES[0]];
    component.ngOnChanges({ attribute: new SimpleChange(ageAttribute, ageAttribute, false) });
    expect(control.value).toBe('');
  });

  it('should emit property updates and clear the selection when requested', () => {
    const propertySpy = jasmine.createSpy('propertyChange');
    component.propertyChange.subscribe(propertySpy);

    (component as any).onAttributeSelected('email');
    expect(propertySpy).toHaveBeenCalledWith('email');

    (component as any).clearAttribute();
    expect(propertySpy).toHaveBeenCalledWith(undefined);

    const control = (component as any).attributeControl as { value: string };
    expect(control.value).toBe('');
  });

  it('should sanitize emitted values for single value and range operators', () => {
    const emitted: unknown[] = [];
    component.valueChange.subscribe((value) => {
      emitted.push(
        typeof value === 'object' && value !== null && !Array.isArray(value)
          ? { ...(value as Record<string, unknown>) }
          : value
      );
      component.attribute = { ...component.attribute, value };
    });

    let previousAttribute = component.attribute;
    component.attribute = createAttribute({ propertyType: 'number', operator: 'greaterThan' });
    component.ngOnChanges({ attribute: new SimpleChange(previousAttribute, component.attribute, false) });
    (component as any).onSingleValueChange('123');
    (component as any).onSingleValueChange('abc');
    (component as any).onSingleValueChange('');

    previousAttribute = component.attribute;
    component.attribute = createAttribute({
      propertyType: 'number',
      operator: 'between',
      value: { from: 5, to: 7 }
    });
    component.ngOnChanges({ attribute: new SimpleChange(previousAttribute, component.attribute, false) });
    (component as any).onRangeChange('from', '10');
    (component as any).onRangeChange('to', '');

    expect(emitted).toEqual([
      123,
      undefined,
      undefined,
      { from: 10, to: 7 },
      { from: 10, to: null }
    ]);
  });
});

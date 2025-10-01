import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertySelectorComponent } from './property-selector.component';
import { AttributeFilter, EventProperty } from '../../models';

describe('PropertySelectorComponent', () => {
  let fixture: ComponentFixture<PropertySelectorComponent>;
  let component: PropertySelectorComponent;

  const attributes: EventProperty[] = [
    { property: 'email', type: 'string' },
    { property: 'age', type: 'number' }
  ];

  const baseAttribute: AttributeFilter = {
    id: 1,
    property: undefined,
    propertyType: undefined,
    operator: undefined,
    value: undefined
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertySelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertySelectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('availableAttributes', attributes);
    fixture.componentRef.setInput('attribute', baseAttribute);
    fixture.detectChanges();
  });

  it('should synchronize the control with the provided attribute', () => {
    expect(component.attributeControl.value).toBe('');

    const updated: AttributeFilter = {
      ...baseAttribute,
      property: 'email',
      propertyType: 'string'
    };

    fixture.componentRef.setInput('attribute', updated);
    fixture.detectChanges();

    expect(component.attributeControl.value).toBe('email');

    fixture.componentRef.setInput('availableAttributes', [attributes[1]]);
    fixture.detectChanges();

    expect(component.attributeControl.value).toBe('');
  });

  it('should emit property changes and clear the value when requested', () => {
    const spy = jasmine.createSpy('propertyChange');
    component.propertyChange.subscribe(spy);

    component.onAttributeSelected('age');
    expect(spy).toHaveBeenCalledWith('age');

    component.clearAttribute();
    expect(spy).toHaveBeenCalledWith(undefined);
    expect(component.attributeControl.value).toBe('');
  });

  it('should filter the available attributes based on the control value', () => {
    component.attributeControl.setValue('a');

    expect(component.filteredAttributes().map((item) => item.property)).toEqual([
      'email',
      'age'
    ]);

    component.attributeControl.setValue('em');

    expect(component.filteredAttributes().map((item) => item.property)).toEqual(['email']);
  });
});

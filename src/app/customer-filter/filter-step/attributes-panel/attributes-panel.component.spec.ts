import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributesPanelComponent } from './attributes-panel.component';
import { AttributeFilter } from '../../models';

describe('AttributesPanelComponent', () => {
  let fixture: ComponentFixture<AttributesPanelComponent>;
  let component: AttributesPanelComponent;

  const STEP_ID = 3;
  const attributes: AttributeFilter[] = [
    { id: 1, property: 'status', propertyType: 'string', operator: 'equals', value: 'active' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributesPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AttributesPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('stepId', STEP_ID);
    fixture.detectChanges();
  });

  it('should expose whether attributes are present', () => {
    expect(component.hasAttributes()).toBeFalse();

    fixture.componentRef.setInput('attributes', attributes);
    fixture.detectChanges();

    expect(component.hasAttributes()).toBeTrue();
  });

  it('should emit events for attribute mutations', () => {
    const propertySpy = jasmine.createSpy('property');
    const operatorSpy = jasmine.createSpy('operator');
    const valueSpy = jasmine.createSpy('value');
    const removeSpy = jasmine.createSpy('remove');

    component.attributePropertyChange.subscribe(propertySpy);
    component.attributeOperatorChange.subscribe(operatorSpy);
    component.attributeValueChange.subscribe(valueSpy);
    component.removeAttribute.subscribe(removeSpy);

    component.onAttributePropertyChange(7, 'email');
    component.onAttributeOperatorChange(7, 'contains');
    component.onAttributeValueChange(7, 'user@example.com');
    component.onRemoveAttribute(7);

    expect(propertySpy).toHaveBeenCalledWith({ stepId: STEP_ID, attributeId: 7, property: 'email' });
    expect(operatorSpy).toHaveBeenCalledWith({
      stepId: STEP_ID,
      attributeId: 7,
      operator: 'contains'
    });
    expect(valueSpy).toHaveBeenCalledWith({ stepId: STEP_ID, attributeId: 7, value: 'user@example.com' });
    expect(removeSpy).toHaveBeenCalledWith({ stepId: STEP_ID, attributeId: 7 });
  });

  it('should emit the step id when requesting an attribute addition', () => {
    const addSpy = jasmine.createSpy('add');
    component.addAttribute.subscribe(addSpy);

    component.onAddAttribute();

    expect(addSpy).toHaveBeenCalledWith(STEP_ID);
  });
});

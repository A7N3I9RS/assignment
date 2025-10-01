import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterStepComponent } from './filter-step.component';
import { EventDefinition, FilterStep } from '../models';

const EVENTS: EventDefinition[] = [
  { type: 'SignUp', properties: [] },
  { type: 'Purchase', properties: [] }
];

describe('FilterStepComponent', () => {
  let fixture: ComponentFixture<FilterStepComponent>;
  let component: FilterStepComponent;
  let baseStep: FilterStep;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterStepComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterStepComponent);
    component = fixture.componentInstance;
    baseStep = { id: 1, eventType: 'SignUp', attributes: [] };
    fixture.componentRef.setInput('step', { ...baseStep, attributes: [] });
    fixture.componentRef.setInput('events', EVENTS);
    fixture.detectChanges();
  });

  it('should synchronize the event control and emit clearing events when deselected', () => {
    expect(component.eventControl.value).toBe('SignUp');

    const eventSpy = jasmine.createSpy('eventSelect');
    component.eventSelect.subscribe(eventSpy);

    component.clearEvent();
    expect(component.eventControl.value).toBeNull();
    expect(eventSpy).toHaveBeenCalledWith({ stepId: baseStep.id, eventType: undefined });

    const updatedStep: FilterStep = { id: baseStep.id, eventType: 'Purchase', attributes: [] };
    fixture.componentRef.setInput('step', updatedStep);
    fixture.detectChanges();
    expect(component.eventControl.value).toBe('Purchase');
  });

  it('should expose selected events and filter the available options', () => {
    component.eventControl.setValue('pur');
    expect(component.filteredEventOptions()).toEqual([EVENTS[1]]);

    fixture.componentRef.setInput('step', { id: baseStep.id, eventType: 'Purchase', attributes: [] });
    fixture.detectChanges();
    expect(component.selectedEvent()).toEqual(EVENTS[1]);
  });

  it('should forward attribute interaction events with the current step context', () => {
    const addSpy = jasmine.createSpy('addAttribute');
    component.addAttribute.subscribe(addSpy);

    const propertySpy = jasmine.createSpy('propertyChange');
    component.attributePropertyChange.subscribe(propertySpy);

    const operatorSpy = jasmine.createSpy('operatorChange');
    component.attributeOperatorChange.subscribe(operatorSpy);

    const valueSpy = jasmine.createSpy('valueChange');
    component.attributeValueChange.subscribe(valueSpy);

    const removeAttributeSpy = jasmine.createSpy('removeAttribute');
    component.removeAttribute.subscribe(removeAttributeSpy);

    const duplicateSpy = jasmine.createSpy('duplicate');
    component.duplicate.subscribe(duplicateSpy);

    const removeSpy = jasmine.createSpy('remove');
    component.remove.subscribe(removeSpy);

    component.onAddAttribute();
    expect(addSpy).toHaveBeenCalledWith(baseStep.id);

    component.onAttributePropertyChange(7, 'email');
    expect(propertySpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7, property: 'email' });

    component.onAttributeOperatorChange(7, 'equals');
    expect(operatorSpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7, operator: 'equals' });

    component.onAttributeValueChange(7, 'value');
    expect(valueSpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7, value: 'value' });

    component.onRemoveAttribute(7);
    expect(removeAttributeSpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7 });

    component.onDuplicateStep();
    expect(duplicateSpy).toHaveBeenCalledWith(baseStep.id);

    component.onRemoveStep();
    expect(removeSpy).toHaveBeenCalledWith(baseStep.id);
  });
});

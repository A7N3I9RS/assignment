import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';

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
    component.step = { ...baseStep, attributes: [] };
    component.events = EVENTS;
    component.ngOnChanges({ step: new SimpleChange(undefined, component.step, true) });
    fixture.detectChanges();
  });

  it('should synchronize the event control and emit clearing events when deselected', () => {
    const componentAny = component as any;
    expect(componentAny.eventControl.value).toBe('SignUp');

    const eventSpy = jasmine.createSpy('eventSelect');
    component.eventSelect.subscribe(eventSpy);

    componentAny.clearEvent();
    expect(componentAny.eventControl.value).toBeNull();
    expect(eventSpy).toHaveBeenCalledWith({ stepId: baseStep.id, eventType: undefined });

    const updatedStep: FilterStep = { id: baseStep.id, eventType: 'Purchase', attributes: [] };
    component.step = updatedStep;
    component.ngOnChanges({ step: new SimpleChange(baseStep, updatedStep, false) });
    expect(componentAny.eventControl.value).toBe('Purchase');
  });

  it('should expose selected events and filter the available options', () => {
    const componentAny = component as any;
    const filtered = componentAny.filterEvents('pur');
    expect(filtered).toEqual([EVENTS[1]]);

    component.step = { id: baseStep.id, eventType: 'Purchase', attributes: [] };
    component.ngOnChanges({ step: new SimpleChange(baseStep, component.step, false) });
    expect(componentAny.selectedEvent).toEqual(EVENTS[1]);
    expect(componentAny.displayEvent('SignUp')).toBe('SignUp');
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

    const componentAny = component as any;

    componentAny.onAddAttribute();
    expect(addSpy).toHaveBeenCalledWith(baseStep.id);

    componentAny.onAttributePropertyChange(7, 'email');
    expect(propertySpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7, property: 'email' });

    componentAny.onAttributeOperatorChange(7, 'equals');
    expect(operatorSpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7, operator: 'equals' });

    componentAny.onAttributeValueChange(7, 'value');
    expect(valueSpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7, value: 'value' });

    componentAny.onRemoveAttribute(7);
    expect(removeAttributeSpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7 });

    componentAny.onDuplicateStep();
    expect(duplicateSpy).toHaveBeenCalledWith(baseStep.id);

    componentAny.onRemoveStep();
    expect(removeSpy).toHaveBeenCalledWith(baseStep.id);

    expect(componentAny.trackAttribute(0, { id: 42 })).toBe(42);
  });
});

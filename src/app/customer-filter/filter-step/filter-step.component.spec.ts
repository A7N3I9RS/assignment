import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FilterStepComponent } from './filter-step.component';
import { EventDefinition, FilterStep } from '../models';
import { EventSelectorComponent } from './event-selector/event-selector.component';
import { AttributesPanelComponent } from './attributes-panel/attributes-panel.component';
import { StepHeaderComponent } from './step-header/step-header.component';

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
    const eventSelector = fixture.debugElement.query(By.directive(EventSelectorComponent))
      .componentInstance as EventSelectorComponent;

    expect(eventSelector.eventControl.value).toBe('SignUp');

    const eventSpy = jasmine.createSpy('eventSelect');
    component.eventSelect.subscribe(eventSpy);

    eventSelector.clearSelection();
    expect(eventSelector.eventControl.value).toBeNull();
    expect(eventSpy).toHaveBeenCalledWith({ stepId: baseStep.id, eventType: undefined });

    const updatedStep: FilterStep = { id: baseStep.id, eventType: 'Purchase', attributes: [] };
    fixture.componentRef.setInput('step', updatedStep);
    fixture.detectChanges();
    expect(eventSelector.eventControl.value).toBe('Purchase');
  });

  it('should expose selected events and filter the available options', () => {
    const eventSelector = fixture.debugElement.query(By.directive(EventSelectorComponent))
      .componentInstance as EventSelectorComponent;

    eventSelector.eventControl.setValue('pur');
    expect(eventSelector.filteredEventOptions()).toEqual([EVENTS[1]]);

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

    const attributesPanel = fixture.debugElement.query(By.directive(AttributesPanelComponent))
      .componentInstance as AttributesPanelComponent;

    attributesPanel.onAddAttribute();
    expect(addSpy).toHaveBeenCalledWith(baseStep.id);

    attributesPanel.onAttributePropertyChange(7, 'email');
    expect(propertySpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7, property: 'email' });

    attributesPanel.onAttributeOperatorChange(7, 'equals');
    expect(operatorSpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7, operator: 'equals' });

    attributesPanel.onAttributeValueChange(7, 'value');
    expect(valueSpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7, value: 'value' });

    attributesPanel.onRemoveAttribute(7);
    expect(removeAttributeSpy).toHaveBeenCalledWith({ stepId: baseStep.id, attributeId: 7 });

    const duplicateSpy = jasmine.createSpy('duplicate');
    component.duplicate.subscribe(duplicateSpy);

    const removeSpy = jasmine.createSpy('remove');
    component.remove.subscribe(removeSpy);

    const stepHeader = fixture.debugElement.query(By.directive(StepHeaderComponent))
      .componentInstance as StepHeaderComponent;

    stepHeader.onDuplicateStep();
    expect(duplicateSpy).toHaveBeenCalledWith(baseStep.id);

    stepHeader.onRemoveStep();
    expect(removeSpy).toHaveBeenCalledWith(baseStep.id);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSelectorComponent } from './event-selector.component';
import { EventDefinition, FilterStep } from '../../models';

const EVENTS: EventDefinition[] = [
  { type: 'Signup', properties: [] },
  { type: 'Purchase', properties: [] }
];

function createStep(overrides: Partial<FilterStep> = {}): FilterStep {
  return {
    id: 1,
    eventType: undefined,
    attributes: [],
    ...overrides
  } as FilterStep;
}

describe('EventSelectorComponent', () => {
  let fixture: ComponentFixture<EventSelectorComponent>;
  let component: EventSelectorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EventSelectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('events', EVENTS);
    fixture.componentRef.setInput('step', createStep());
    fixture.detectChanges();
  });

  it('should synchronize the control with the current step event', () => {
    expect(component.eventControl.value).toBeNull();

    const updated = createStep({ eventType: 'Purchase' });
    fixture.componentRef.setInput('step', updated);
    fixture.detectChanges();

    expect(component.eventControl.value).toBe('Purchase');
    expect(component.filteredEventOptions().map((item) => item.type)).toEqual(['Purchase']);
  });

  it('should emit events when selecting and clearing values', () => {
    const selectSpy = jasmine.createSpy('select');
    const clearSpy = jasmine.createSpy('clear');

    component.eventSelect.subscribe(selectSpy);
    component.clearEvent.subscribe(clearSpy);

    component.onEventSelected('Signup');
    expect(selectSpy).toHaveBeenCalledWith('Signup');

    const withEvent = createStep({ eventType: 'Signup' });
    fixture.componentRef.setInput('step', withEvent);
    fixture.detectChanges();

    component.clearSelection();
    expect(component.eventControl.value).toBeNull();
    expect(clearSpy).toHaveBeenCalled();
  });
});

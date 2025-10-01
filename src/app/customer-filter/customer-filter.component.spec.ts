import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';

import { CustomerFilterComponent } from './customer-filter.component';
import { FilterStateService } from './filter-state.service';
import { EventDefinition, FilterStep } from './models';
import { FilterStepComponent } from './filter-step/filter-step.component';

const EVENTS: EventDefinition[] = [
  {
    type: 'SignUp',
    properties: [
      { property: 'email', type: 'string' },
      { property: 'age', type: 'number' }
    ]
  }
];

const STEP: FilterStep = { id: 1, attributes: [] };

class MockFilterStateService {
  events = signal<EventDefinition[]>(EVENTS);
  loading = signal(false);
  loadingError = signal(false);
  steps = signal<FilterStep[]>([STEP]);
  canDiscard = signal(true);

  initialize = jasmine.createSpy('initialize');
  addStep = jasmine.createSpy('addStep');
  duplicateStep = jasmine.createSpy('duplicateStep');
  removeStep = jasmine.createSpy('removeStep');
  onEventSelect = jasmine.createSpy('onEventSelect');
  addAttribute = jasmine.createSpy('addAttribute');
  removeAttribute = jasmine.createSpy('removeAttribute');
  onAttributePropertyChange = jasmine.createSpy('onAttributePropertyChange');
  onAttributeOperatorChange = jasmine.createSpy('onAttributeOperatorChange');
  onAttributeValueChange = jasmine.createSpy('onAttributeValueChange');
  discardFilters = jasmine.createSpy('discardFilters');
  applyFilters = jasmine.createSpy('applyFilters');
  fetchEvents = jasmine.createSpy('fetchEvents');
}

describe('CustomerFilterComponent', () => {
  let fixture: ComponentFixture<CustomerFilterComponent>;
  let filterState: MockFilterStateService;

  beforeEach(async () => {
    filterState = new MockFilterStateService();

    await TestBed.configureTestingModule({
      imports: [CustomerFilterComponent],
      providers: [{ provide: FilterStateService, useValue: filterState }]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerFilterComponent);
  });

  it('should initialize the filter state on init', () => {
    fixture.detectChanges();
    expect(filterState.initialize).toHaveBeenCalledTimes(1);
  });

  it('should render steps from the state service and forward events', () => {
    fixture.detectChanges();

    const filterStepDebug = fixture.debugElement.query(By.directive(FilterStepComponent));
    expect(filterStepDebug).toBeTruthy();

    const filterStepComponent = filterStepDebug.componentInstance as FilterStepComponent;
    filterStepComponent.eventSelect.emit({ stepId: STEP.id, eventType: 'SignUp' });
    expect(filterState.onEventSelect).toHaveBeenCalledWith({ stepId: STEP.id, eventType: 'SignUp' });

    filterStepComponent.addAttribute.emit(STEP.id);
    expect(filterState.addAttribute).toHaveBeenCalledWith(STEP.id);

    filterStepComponent.duplicate.emit(STEP.id);
    expect(filterState.duplicateStep).toHaveBeenCalledWith(STEP.id);
  });

  it('should trigger service methods from template interactions', () => {
    fixture.detectChanges();

    const discardButton: HTMLButtonElement = fixture.nativeElement.querySelector('button.hazard');
    discardButton.click();
    expect(filterState.discardFilters).toHaveBeenCalled();

    const addStepButton: HTMLButtonElement = fixture.nativeElement.querySelector('button.add-step');
    addStepButton.click();
    expect(filterState.addStep).toHaveBeenCalled();

    const applyButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[matButton="filled"]');
    applyButton.click();
    expect(filterState.applyFilters).toHaveBeenCalled();

    filterState.loadingError.set(true);
    fixture.detectChanges();

    const retryButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[matButton="outlined"]');
    retryButton.click();
    expect(filterState.fetchEvents).toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { FilterStateService } from './filter-state.service';
import { CustomerFilterService } from './customer-filter.service';
import { EventDefinition } from './models';

const EVENTS: EventDefinition[] = [
  {
    type: 'SignUp',
    properties: [
      { property: 'email', type: 'string' },
      { property: 'age', type: 'number' }
    ]
  }
];

describe('FilterStateService', () => {
  let service: FilterStateService;
  let customerFilterService: jasmine.SpyObj<CustomerFilterService>;

  beforeEach(() => {
    customerFilterService = jasmine.createSpyObj<CustomerFilterService>('CustomerFilterService', [
      'getEvents'
    ]);

    TestBed.configureTestingModule({
      providers: [
        FilterStateService,
        { provide: CustomerFilterService, useValue: customerFilterService }
      ]
    });

    service = TestBed.inject(FilterStateService);
  });

  it('should initialize with a single empty step and load events', () => {
    customerFilterService.getEvents.and.returnValue(of({ events: EVENTS }));

    service.initialize();

    expect(customerFilterService.getEvents).toHaveBeenCalledTimes(1);

    const steps = service.steps();
    expect(steps.length).toBe(1);
    expect(steps[0].id).toBe(1);
    expect(steps[0].attributes).toEqual([]);

    expect(service.events()).toEqual(EVENTS);
    expect(service.loading()).toBeFalse();
    expect(service.loadingError()).toBeFalse();
  });

  it('should reset attribute values based on selected operator', () => {
    customerFilterService.getEvents.and.returnValue(of({ events: EVENTS }));
    service.initialize();

    const [initialStep] = service.steps();
    service.onEventSelect({ stepId: initialStep.id, eventType: 'SignUp' });
    service.addAttribute(initialStep.id);

    let [attribute] = service.steps()[0].attributes;
    const attributeId = attribute.id;

    service.onAttributePropertyChange({
      stepId: initialStep.id,
      attributeId,
      property: 'email'
    });

    service.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId,
      value: 'initial value'
    });

    service.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId,
      operator: 'isEmpty'
    });
    attribute = service.steps()[0].attributes[0];
    expect(attribute.operator).toBe('isEmpty');
    expect(attribute.value).toBeUndefined();

    service.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId,
      value: 'should be cleared'
    });
    service.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId,
      operator: 'contains'
    });
    attribute = service.steps()[0].attributes[0];
    expect(attribute.operator).toBe('contains');
    expect(attribute.value).toBeUndefined();

    service.onAttributePropertyChange({
      stepId: initialStep.id,
      attributeId,
      property: 'age'
    });
    service.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId,
      operator: 'between'
    });
    attribute = service.steps()[0].attributes[0];
    expect(attribute.operator).toBe('between');
    expect(attribute.value).toEqual({ from: null, to: null });

    service.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId,
      value: { from: 5, to: 10 }
    });
    const previousRange = service.steps()[0].attributes[0].value;

    service.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId,
      operator: 'between'
    });
    attribute = service.steps()[0].attributes[0];
    expect(attribute.value).toEqual({ from: null, to: null });
    expect(attribute.value).not.toBe(previousRange);
  });

  it('should duplicate steps with new identifiers and cloned values', () => {
    customerFilterService.getEvents.and.returnValue(of({ events: EVENTS }));
    service.initialize();

    const [initialStep] = service.steps();
    service.onEventSelect({ stepId: initialStep.id, eventType: 'SignUp' });

    service.addAttribute(initialStep.id);
    let attribute = service.steps()[0].attributes[0];
    const stringAttributeId = attribute.id;
    service.onAttributePropertyChange({
      stepId: initialStep.id,
      attributeId: stringAttributeId,
      property: 'email'
    });
    service.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId: stringAttributeId,
      operator: 'contains'
    });
    service.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId: stringAttributeId,
      value: 'hello@example.com'
    });

    service.addAttribute(initialStep.id);
    attribute = service.steps()[0].attributes[1];
    const rangeAttributeId = attribute.id;
    service.onAttributePropertyChange({
      stepId: initialStep.id,
      attributeId: rangeAttributeId,
      property: 'age'
    });
    service.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId: rangeAttributeId,
      operator: 'between'
    });
    service.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId: rangeAttributeId,
      value: { from: 18, to: 30 }
    });

    const originalStep = service.steps()[0];
    const originalRangeValue = originalStep.attributes[1].value;

    service.duplicateStep(initialStep.id);

    const steps = service.steps();
    expect(steps.length).toBe(2);

    const duplicate = steps[1];
    expect(duplicate.id).not.toBe(originalStep.id);
    expect(duplicate.eventType).toBe(originalStep.eventType);
    expect(duplicate.attributes.length).toBe(2);

    const [duplicateStringAttr, duplicateRangeAttr] = duplicate.attributes;
    expect(duplicateStringAttr.id).not.toBe(originalStep.attributes[0].id);
    expect(duplicateStringAttr.property).toBe('email');
    expect(duplicateStringAttr.operator).toBe('contains');
    expect(duplicateStringAttr.value).toBe('hello@example.com');

    expect(duplicateRangeAttr.id).not.toBe(originalStep.attributes[1].id);
    expect(duplicateRangeAttr.property).toBe('age');
    expect(duplicateRangeAttr.operator).toBe('between');
    expect(duplicateRangeAttr.value).toEqual({ from: 18, to: 30 });
    expect(duplicateRangeAttr.value).not.toBe(originalRangeValue);
  });

  it('should expose loading errors when the events request fails', () => {
    customerFilterService.getEvents.and.returnValue(throwError(() => new Error('Network error')));

    service.initialize();

    expect(customerFilterService.getEvents).toHaveBeenCalled();
    expect(service.events()).toEqual([]);
    expect(service.loading()).toBeFalse();
    expect(service.loadingError()).toBeTrue();
  });
});

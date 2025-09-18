import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CustomerFilterComponent } from './customer-filter.component';
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

describe('CustomerFilterComponent', () => {
  let fixture: ComponentFixture<CustomerFilterComponent>;
  let component: CustomerFilterComponent;
  let customerFilterService: jasmine.SpyObj<CustomerFilterService>;

  beforeEach(async () => {
    customerFilterService = jasmine.createSpyObj<CustomerFilterService>('CustomerFilterService', [
      'getEvents'
    ]);

    customerFilterService.getEvents.and.returnValue(of({ events: EVENTS }));

    await TestBed.configureTestingModule({
      imports: [CustomerFilterComponent],
      providers: [{ provide: CustomerFilterService, useValue: customerFilterService }]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerFilterComponent);
    component = fixture.componentInstance;
  });

  it('should initialize with a single empty step and load events', () => {
    fixture.detectChanges();
    const componentAny = component as any;

    expect(customerFilterService.getEvents).toHaveBeenCalledTimes(1);

    const steps = componentAny.steps();
    expect(steps.length).toBe(1);
    expect(steps[0].id).toBe(1);
    expect(steps[0].attributes).toEqual([]);

    expect(componentAny.events()).toEqual(EVENTS);
    expect(componentAny.loading()).toBeFalse();
    expect(componentAny.loadingError()).toBeFalse();
  });

  it('should reset attribute values based on selected operator', () => {
    fixture.detectChanges();
    const componentAny = component as any;

    const [initialStep] = componentAny.steps();
    componentAny.onEventSelect({ stepId: initialStep.id, eventType: 'SignUp' });
    componentAny.addAttribute(initialStep.id);

    let [attribute] = componentAny.steps()[0].attributes;
    const attributeId = attribute.id;

    componentAny.onAttributePropertyChange({
      stepId: initialStep.id,
      attributeId,
      property: 'email'
    });

    componentAny.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId,
      value: 'initial value'
    });

    componentAny.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId,
      operator: 'isEmpty'
    });
    attribute = componentAny.steps()[0].attributes[0];
    expect(attribute.operator).toBe('isEmpty');
    expect(attribute.value).toBeUndefined();

    componentAny.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId,
      value: 'should be cleared'
    });
    componentAny.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId,
      operator: 'contains'
    });
    attribute = componentAny.steps()[0].attributes[0];
    expect(attribute.operator).toBe('contains');
    expect(attribute.value).toBeUndefined();

    componentAny.onAttributePropertyChange({
      stepId: initialStep.id,
      attributeId,
      property: 'age'
    });
    componentAny.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId,
      operator: 'between'
    });
    attribute = componentAny.steps()[0].attributes[0];
    expect(attribute.operator).toBe('between');
    expect(attribute.value).toEqual({ from: null, to: null });

    componentAny.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId,
      value: { from: 5, to: 10 }
    });
    const previousRange = componentAny.steps()[0].attributes[0].value;

    componentAny.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId,
      operator: 'between'
    });
    attribute = componentAny.steps()[0].attributes[0];
    expect(attribute.value).toEqual({ from: null, to: null });
    expect(attribute.value).not.toBe(previousRange);
  });

  it('should duplicate steps with new identifiers and cloned values', () => {
    fixture.detectChanges();
    const componentAny = component as any;

    const [initialStep] = componentAny.steps();
    componentAny.onEventSelect({ stepId: initialStep.id, eventType: 'SignUp' });

    componentAny.addAttribute(initialStep.id);
    let attribute = componentAny.steps()[0].attributes[0];
    const stringAttributeId = attribute.id;
    componentAny.onAttributePropertyChange({
      stepId: initialStep.id,
      attributeId: stringAttributeId,
      property: 'email'
    });
    componentAny.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId: stringAttributeId,
      operator: 'contains'
    });
    componentAny.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId: stringAttributeId,
      value: 'hello@example.com'
    });

    componentAny.addAttribute(initialStep.id);
    attribute = componentAny.steps()[0].attributes[1];
    const rangeAttributeId = attribute.id;
    componentAny.onAttributePropertyChange({
      stepId: initialStep.id,
      attributeId: rangeAttributeId,
      property: 'age'
    });
    componentAny.onAttributeOperatorChange({
      stepId: initialStep.id,
      attributeId: rangeAttributeId,
      operator: 'between'
    });
    componentAny.onAttributeValueChange({
      stepId: initialStep.id,
      attributeId: rangeAttributeId,
      value: { from: 18, to: 30 }
    });

    const originalStep = componentAny.steps()[0];
    const originalRangeValue = originalStep.attributes[1].value;

    componentAny.duplicateStep(initialStep.id);

    const steps = componentAny.steps();
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

    fixture.detectChanges();
    const componentAny = component as any;

    expect(customerFilterService.getEvents).toHaveBeenCalled();
    expect(componentAny.events()).toEqual([]);
    expect(componentAny.loading()).toBeFalse();
    expect(componentAny.loadingError()).toBeTrue();
  });
});

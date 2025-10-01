import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorSelectorComponent } from './operator-selector.component';
import { AttributeFilter, AttributeOperator, OperatorOption } from '../../models';

function createAttributeFilter(overrides: Partial<AttributeFilter> = {}): AttributeFilter {
  return {
    id: 1,
    property: 'status',
    propertyType: 'string',
    operator: 'equals',
    ...overrides
  } as AttributeFilter;
}

const OPTIONS: OperatorOption[] = [
  { label: 'Equals', value: 'equals', valueRequirement: 'single', inputType: 'text' },
  {
    label: 'Does not equal',
    value: 'notEquals',
    valueRequirement: 'single',
    inputType: 'text'
  }
];

describe('OperatorSelectorComponent', () => {
  let fixture: ComponentFixture<OperatorSelectorComponent>;
  let component: OperatorSelectorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorSelectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('operatorOptions', OPTIONS);
    fixture.componentRef.setInput('attribute', createAttributeFilter());
    fixture.detectChanges();
  });

  it('should keep the selected option in sync with the attribute input', () => {
    expect(component.selectedOperatorOption()).toEqual(OPTIONS[0]);

    const updatedAttribute = createAttributeFilter({ operator: 'notEquals' as AttributeOperator });
    fixture.componentRef.setInput('attribute', updatedAttribute);
    fixture.detectChanges();

    expect(component.selectedOperatorOption()).toEqual(OPTIONS[1]);
  });

  it('should emit operator changes when a new option is selected', () => {
    const spy = jasmine.createSpy('operatorChange');
    component.operatorChange.subscribe(spy);

    component.onOperatorSelected('notEquals');

    expect(component.selectedOperatorOption()).toEqual(OPTIONS[1]);
    expect(spy).toHaveBeenCalledWith('notEquals');

    component.onOperatorSelected(null);

    expect(component.selectedOperatorOption()).toBeUndefined();
    expect(spy).toHaveBeenCalledWith(undefined);
  });
});

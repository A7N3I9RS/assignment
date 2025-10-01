import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import {
  AttributeFilter,
  AttributeOperator,
  AttributeValue,
  EventProperty,
  NUMBER_OPERATORS,
  OperatorOption,
  STRING_OPERATORS,
  ValueRequirement
} from '../models';
import { PropertySelectorComponent } from './property-selector/property-selector.component';
import { OperatorSelectorComponent } from './operator-selector/operator-selector.component';
import { ValueInputComponent } from './value-input/value-input.component';

@Component({
  selector: 'app-attribute-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    PropertySelectorComponent,
    OperatorSelectorComponent,
    ValueInputComponent
  ],
  templateUrl: './attribute-filter.component.html',
  styleUrl: './attribute-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeFilterComponent {
  readonly attribute = input.required<AttributeFilter>();
  readonly availableAttributes = input<EventProperty[]>([]);
  readonly eventLabel = input<string | undefined>(undefined);
  readonly stringOperators = input<OperatorOption[]>(STRING_OPERATORS);
  readonly numberOperators = input<OperatorOption[]>(NUMBER_OPERATORS);

  readonly propertyChange = output<string | undefined>();
  readonly operatorChange = output<AttributeOperator | undefined>();
  readonly valueChange = output<AttributeValue>();
  readonly remove = output<void>();

  readonly operatorOptions = computed(() => {
    const attribute = this.attribute();
    return attribute.propertyType === 'number' ? this.numberOperators() : this.stringOperators();
  });

  readonly selectedOperatorConfiguration = computed(() => {
    const attribute = this.attribute();
    const options = this.operatorOptions();
    return options.find((item) => item.value === attribute.operator);
  });

  readonly valueRequirement = computed<ValueRequirement>(() => {
    return this.selectedOperatorConfiguration()?.valueRequirement ?? 'none';
  });

  readonly inputType = computed<'text' | 'number'>(() => {
    return this.selectedOperatorConfiguration()?.inputType ?? 'text';
  });
}

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  AttributeFilter,
  AttributeOperator,
  AttributeValue,
  EventProperty
} from '../../models';
import { AttributeFilterComponent } from '../../attribute-filter/attribute-filter.component';

@Component({
  selector: 'app-filter-step-attributes-panel',
  imports: [CommonModule, MatButtonModule, MatIconModule, AttributeFilterComponent],
  templateUrl: './attributes-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'attribute-column'
  }
})
export class AttributesPanelComponent {
  readonly stepId = input.required<number>();
  readonly eventType = input<string | undefined>(undefined);
  readonly attributes = input<AttributeFilter[]>([]);
  readonly availableAttributes = input<EventProperty[]>([]);

  readonly addAttribute = output<number>();
  readonly attributePropertyChange = output<{
    stepId: number;
    attributeId: number;
    property?: string;
  }>();
  readonly attributeOperatorChange = output<{
    stepId: number;
    attributeId: number;
    operator?: AttributeOperator;
  }>();
  readonly attributeValueChange = output<{
    stepId: number;
    attributeId: number;
    value: AttributeValue;
  }>();
  readonly removeAttribute = output<{ stepId: number; attributeId: number }>();

  readonly hasAttributes = computed(() => this.attributes().length > 0);

  onAddAttribute(): void {
    this.addAttribute.emit(this.stepId());
  }

  onAttributePropertyChange(attributeId: number, property?: string): void {
    this.attributePropertyChange.emit({
      stepId: this.stepId(),
      attributeId,
      property
    });
  }

  onAttributeOperatorChange(attributeId: number, operator?: AttributeOperator): void {
    this.attributeOperatorChange.emit({
      stepId: this.stepId(),
      attributeId,
      operator
    });
  }

  onAttributeValueChange(attributeId: number, value: AttributeValue): void {
    this.attributeValueChange.emit({
      stepId: this.stepId(),
      attributeId,
      value
    });
  }

  onRemoveAttribute(attributeId: number): void {
    this.removeAttribute.emit({ stepId: this.stepId(), attributeId });
  }
}

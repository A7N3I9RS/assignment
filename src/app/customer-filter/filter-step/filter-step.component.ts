import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

import {
  AttributeOperator,
  AttributeValue,
  EventDefinition,
  FilterStep
} from '../models';
import { StepHeaderComponent } from './step-header/step-header.component';
import { EventSelectorComponent } from './event-selector/event-selector.component';
import { AttributesPanelComponent } from './attributes-panel/attributes-panel.component';

@Component({
  selector: 'app-filter-step',
  imports: [
    CommonModule,
    MatDividerModule,
    StepHeaderComponent,
    EventSelectorComponent,
    AttributesPanelComponent
  ],
  templateUrl: './filter-step.component.html',
  styleUrl: './filter-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterStepComponent {
  readonly step = input.required<FilterStep>();
  readonly events = input.required<EventDefinition[]>();
  readonly stepIndex = input(0);
  readonly isOnlyStep = input(false);

  readonly eventSelect = output<{ stepId: number; eventType?: string }>();
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
  readonly duplicate = output<number>();
  readonly remove = output<number>();

  readonly selectedEvent = computed(() => {
    const currentStep = this.step();
    return this.events().find((event) => event.type === currentStep.eventType);
  });

  protected onEventSelected(eventType: string): void {
    this.eventSelect.emit({ stepId: this.step().id, eventType });
  }

  protected onEventCleared(): void {
    this.eventSelect.emit({ stepId: this.step().id, eventType: undefined });
  }
}

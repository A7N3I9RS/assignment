import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';

import {
  AttributeFilter,
  AttributeOperator,
  AttributeValue,
  EventDefinition,
  FilterStep,
  NUMBER_OPERATORS,
  OperatorOption,
  RangeValue,
  STRING_OPERATORS
} from './models';
import { FilterStepComponent } from './filter-step/filter-step.component';
import { CustomerFilterService } from './customer-filter.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-customer-filter',
  imports: [CommonModule, MatButtonModule, MatIconModule, FilterStepComponent, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './customer-filter.component.html',
  styleUrl: './customer-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerFilterComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly customerFilterService = inject(CustomerFilterService);

  protected readonly events = signal<EventDefinition[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadingError = signal(false);
  protected readonly steps = signal<FilterStep[]>([]);

  protected readonly canDiscard = computed(() => {
    const steps = this.steps();
    if (steps.length !== 1) {
      return true;
    }

    const [step] = steps;
    return Boolean(step.eventType || step.attributes.length > 0);
  });

  private stepIdCounter = 0;
  private attributeIdCounter = 0;

  ngOnInit(): void {
    this.steps.set([this.createEmptyStep()]);
    this.fetchEvents();
  }

  protected addStep(): void {
    const nextStep = this.createEmptyStep();
    this.steps.update((steps) => [...steps, nextStep]);
  }

  protected duplicateStep(stepId: number): void {
    const stepToClone = this.steps().find((step) => step.id === stepId);
    if (!stepToClone) {
      return;
    }

    const clone = this.cloneStep(stepToClone);
    this.steps.update((steps) => [...steps, clone]);
  }

  protected removeStep(stepId: number): void {
    this.steps.update((steps) => {
      const updated = steps.filter((step) => step.id !== stepId);
      return updated.length > 0 ? updated : [this.createEmptyStep()];
    });
  }

  protected onEventSelect(event: { stepId: number; eventType?: string }): void {
    this.updateStep(event.stepId, (step) => {
      const isSameEvent = step.eventType === event.eventType;
      return {
        ...step,
        eventType: event.eventType,
        attributes: isSameEvent ? step.attributes : []
      };
    });
  }

  protected addAttribute(stepId: number): void {
    this.updateStep(stepId, (step) => {
      if (!step.eventType) {
        return step;
      }

      return {
        ...step,
        attributes: [...step.attributes, this.createEmptyAttribute()]
      };
    });
  }

  protected removeAttribute(event: { stepId: number; attributeId: number }): void {
    this.updateStep(event.stepId, (step) => ({
      ...step,
      attributes: step.attributes.filter((attribute) => attribute.id !== event.attributeId)
    }));
  }

  protected onAttributePropertyChange(event: {
    stepId: number;
    attributeId: number;
    property?: string;
  }): void {
    this.updateStep(event.stepId, (step) => {
      const propertyType = this.getPropertyType(step.eventType, event.property);
      return {
        ...step,
        attributes: step.attributes.map((attribute) =>
          attribute.id === event.attributeId
            ? {
              ...attribute,
              property: event.property,
              propertyType,
              operator: undefined,
              value: undefined
            }
            : attribute
        )
      };
    });
  }

  protected onAttributeOperatorChange(event: {
    stepId: number;
    attributeId: number;
    operator?: AttributeOperator;
  }): void {
    this.updateStep(event.stepId, (step) => ({
      ...step,
      attributes: step.attributes.map((attribute) => {
        if (attribute.id !== event.attributeId) {
          return attribute;
        }

        const option = this.getOperatorOption(attribute.propertyType, event.operator);
        let value: AttributeValue = attribute.value;

        if (!event.operator || !option || option.valueRequirement === 'none') {
          value = undefined;
        } else if (option.valueRequirement === 'range') {
          value = { from: null, to: null };
        } else if (option.valueRequirement === 'single') {
          value = undefined;
        }

        return {
          ...attribute,
          operator: event.operator,
          value
        };
      })
    }));
  }

  protected onAttributeValueChange(event: {
    stepId: number;
    attributeId: number;
    value: AttributeValue;
  }): void {
    this.updateStep(event.stepId, (step) => ({
      ...step,
      attributes: step.attributes.map((attribute) =>
        attribute.id === event.attributeId ? { ...attribute, value: event.value } : attribute
      )
    }));
  }

  protected discardFilters(): void {
    this.steps.set([this.createEmptyStep()]);
  }

  protected applyFilters(): void {
    const dataModel = {
      steps: this.steps().map((step) => ({
        id: step.id,
        event: step.eventType ?? null,
        attributes: step.attributes
          .filter((attribute): attribute is AttributeFilter & {
            property: string;
            operator: AttributeOperator;
          } => Boolean(attribute.property && attribute.operator))
          .map((attribute) => ({
            property: attribute.property,
            type: attribute.propertyType ?? null,
            operator: attribute.operator,
            value: this.normalizeValue(attribute)
          }))
      }))
    };

    console.log('Customer filter model', dataModel);
  }

  protected fetchEvents(): void {
    this.loading.set(true);
    this.loadingError.set(false);
    this.customerFilterService
      .getEvents()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => this.events.set(response.events),
        error: () => {
          this.loadingError.set(true);
        }
      });
  }

  private updateStep(stepId: number, updater: (step: FilterStep) => FilterStep): void {
    this.steps.update((steps) => steps.map((step) => (step.id === stepId ? updater(step) : step)));
  }

  private createEmptyStep(): FilterStep {
    return { id: this.nextStepId(), attributes: [] };
  }

  private createEmptyAttribute(): AttributeFilter {
    return { id: this.nextAttributeId() };
  }

  private nextStepId(): number {
    this.stepIdCounter += 1;
    return this.stepIdCounter;
  }

  private nextAttributeId(): number {
    this.attributeIdCounter += 1;
    return this.attributeIdCounter;
  }

  private cloneStep(step: FilterStep): FilterStep {
    return {
      id: this.nextStepId(),
      eventType: step.eventType,
      attributes: step.attributes.map((attribute) => this.cloneAttribute(attribute))
    };
  }

  private cloneAttribute(attribute: AttributeFilter): AttributeFilter {
    let value: AttributeValue = attribute.value;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      value = { ...(value as RangeValue) };
    }

    return {
      id: this.nextAttributeId(),
      property: attribute.property,
      propertyType: attribute.propertyType,
      operator: attribute.operator,
      value
    };
  }

  private getPropertyType(
    eventType: string | undefined,
    property?: string
  ): EventDefinition['properties'][number]['type'] | undefined {
    if (!eventType || !property) {
      return undefined;
    }

    const event = this.events().find((definition) => definition.type === eventType);
    return event?.properties.find((attr) => attr.property === property)?.type;
  }

  private getOperatorOption(
    propertyType: EventDefinition['properties'][number]['type'] | undefined,
    operator?: AttributeOperator
  ): OperatorOption | undefined {
    if (!operator) {
      return undefined;
    }

    const operators = propertyType === 'number' ? NUMBER_OPERATORS : STRING_OPERATORS;
    return operators.find((option) => option.value === operator);
  }

  private normalizeValue(attribute: AttributeFilter): AttributeValue {
    const option = this.getOperatorOption(attribute.propertyType, attribute.operator);

    if (!option || option.valueRequirement === 'none') {
      return undefined;
    }

    if (option.valueRequirement === 'range') {
      if (attribute.value && typeof attribute.value === 'object' && !Array.isArray(attribute.value)) {
        const range = attribute.value as RangeValue;
        return { from: range.from ?? null, to: range.to ?? null };
      }

      return { from: null, to: null };
    }

    return attribute.value;
  }
}

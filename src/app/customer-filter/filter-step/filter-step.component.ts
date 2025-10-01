import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import {
  AttributeOperator,
  AttributeValue,
  EventDefinition,
  FilterStep
} from '../models';
import { AttributeFilterComponent } from '../attribute-filter/attribute-filter.component';

@Component({
  selector: 'app-filter-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    AttributeFilterComponent
  ],
  templateUrl: './filter-step.component.html',
  styleUrl: './filter-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterStepComponent implements OnInit, AfterViewInit {
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

  private readonly destroyRef = inject(DestroyRef);

  readonly eventControl = new FormControl<string | null>(null);

  private readonly eventAutocomplete = viewChild<MatAutocomplete>(MatAutocomplete);

  readonly filteredEventOptions = signal<EventDefinition[]>([]);

  readonly selectedEvent = signal<EventDefinition | undefined>(undefined);

  constructor() {
    effect(() => {
      const currentEvents = this.events();
      const currentStep = this.step();
      const selected = currentStep.eventType ?? null;

      if (this.eventControl.value !== selected) {
        this.eventControl.setValue(selected, { emitEvent: false });
      }

      const matchedEvent = currentEvents.find((event) => event.type === currentStep.eventType);
      this.selectedEvent.set(matchedEvent);
      this.updateFilteredEvents(this.eventControl.value);
      this.syncAutocompleteSelection();
    });
  }

  ngOnInit(): void {
    this.eventControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.updateFilteredEvents(value);

        if ((value ?? '') === '' && this.step().eventType) {
          this.eventSelect.emit({ stepId: this.step().id, eventType: undefined });
        }
      });
  }

  ngAfterViewInit(): void {
    const autocomplete = this.eventAutocomplete();
    if (!autocomplete) {
      return;
    }

    autocomplete.options.changes
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncAutocompleteSelection());

    this.syncAutocompleteSelection();
  }

  onEventSelected(eventType: string): void {
    this.eventSelect.emit({ stepId: this.step().id, eventType });
  }

  clearEvent(): void {
    this.eventControl.setValue(null);
  }

  onAddAttribute(): void {
    this.addAttribute.emit(this.step().id);
  }

  onAttributePropertyChange(attributeId: number, property?: string): void {
    this.attributePropertyChange.emit({ stepId: this.step().id, attributeId, property });
  }

  onAttributeOperatorChange(attributeId: number, operator?: AttributeOperator): void {
    this.attributeOperatorChange.emit({ stepId: this.step().id, attributeId, operator });
  }

  onAttributeValueChange(attributeId: number, value: AttributeValue): void {
    this.attributeValueChange.emit({ stepId: this.step().id, attributeId, value });
  }

  onRemoveAttribute(attributeId: number): void {
    this.removeAttribute.emit({ stepId: this.step().id, attributeId });
  }

  onDuplicateStep(): void {
    this.duplicate.emit(this.step().id);
  }

  onRemoveStep(): void {
    this.remove.emit(this.step().id);
  }

  private updateFilteredEvents(query: string | null): void {
    const search = (query ?? '').toLowerCase();
    const events = this.events();
    this.filteredEventOptions.set(
      events.filter((event) => event.type.toLowerCase().includes(search))
    );
  }

  private syncAutocompleteSelection(): void {
    const autocomplete = this.eventAutocomplete();
    if (!autocomplete) {
      return;
    }

    const selectedEventType = this.step().eventType;

    const options = autocomplete.options;
    if (!options) {
      return;
    }

    options.forEach((option: MatOption<string>) => {
      const shouldSelect = !!selectedEventType && option.value === selectedEventType;

      if (shouldSelect) {
        if (!option.selected) {
          option.select(false);
        }
      } else if (option.selected) {
        option.deselect(false);
      }
    });
  }
}

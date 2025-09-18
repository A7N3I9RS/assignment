import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class FilterStepComponent implements OnChanges, OnInit {
  @Input({ required: true }) step!: FilterStep;
  @Input({ required: true }) events: EventDefinition[] = [];
  @Input() stepIndex = 0;
  @Input() isOnlyStep = false;

  @Output() eventSelect = new EventEmitter<{ stepId: number; eventType?: string }>();
  @Output() addAttribute = new EventEmitter<number>();
  @Output() attributePropertyChange = new EventEmitter<{
    stepId: number;
    attributeId: number;
    property?: string;
  }>();
  @Output() attributeOperatorChange = new EventEmitter<{
    stepId: number;
    attributeId: number;
    operator?: AttributeOperator;
  }>();
  @Output() attributeValueChange = new EventEmitter<{
    stepId: number;
    attributeId: number;
    value: AttributeValue;
  }>();
  @Output() removeAttribute = new EventEmitter<{ stepId: number; attributeId: number }>();
  @Output() duplicate = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  private readonly destroyRef = inject(DestroyRef);

  protected readonly eventControl = new FormControl<string | null>(null);

  ngOnInit(): void {
    this.eventControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if ((value ?? '') === '' && this.step?.eventType) {
          this.eventSelect.emit({ stepId: this.step.id, eventType: undefined });
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['step']) {
      const selected = this.step?.eventType ?? null;
      if (this.eventControl.value !== selected) {
        this.eventControl.setValue(selected, { emitEvent: false });
      }
    }
  }

  protected get selectedEvent(): EventDefinition | undefined {
    return this.events.find((event) => event.type === this.step?.eventType);
  }

  protected filterEvents(query: string | null): EventDefinition[] {
    const search = (query ?? '').toLowerCase();
    return this.events.filter((event) => event.type.toLowerCase().includes(search));
  }

  protected displayEvent(type: string): string {
    return type;
  }

  protected onEventSelected(eventType: string): void {
    this.eventSelect.emit({ stepId: this.step.id, eventType });
  }

  protected clearEvent(): void {
    this.eventControl.setValue(null);
  }

  protected onAddAttribute(): void {
    this.addAttribute.emit(this.step.id);
  }

  protected onAttributePropertyChange(attributeId: number, property?: string): void {
    this.attributePropertyChange.emit({ stepId: this.step.id, attributeId, property });
  }

  protected onAttributeOperatorChange(attributeId: number, operator?: AttributeOperator): void {
    this.attributeOperatorChange.emit({ stepId: this.step.id, attributeId, operator });
  }

  protected onAttributeValueChange(attributeId: number, value: AttributeValue): void {
    this.attributeValueChange.emit({ stepId: this.step.id, attributeId, value });
  }

  protected onRemoveAttribute(attributeId: number): void {
    this.removeAttribute.emit({ stepId: this.step.id, attributeId });
  }

  protected onDuplicateStep(): void {
    this.duplicate.emit(this.step.id);
  }

  protected onRemoveStep(): void {
    this.remove.emit(this.step.id);
  }

  protected trackAttribute(_index: number, attribute: { id: number }): number {
    return attribute.id;
  }
}

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import {
  AttributeFilter,
  AttributeOperator,
  AttributeValue,
  EventProperty,
  NUMBER_OPERATORS,
  OperatorOption,
  RangeValue,
  STRING_OPERATORS
} from '../models';

@Component({
  selector: 'app-attribute-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule
  ],
  templateUrl: './attribute-filter.component.html',
  styleUrl: './attribute-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeFilterComponent implements OnChanges {
  @Input({ required: true }) attribute!: AttributeFilter;
  @Input({ required: true }) availableAttributes: EventProperty[] = [];
  @Input() eventLabel?: string;
  @Input() stringOperators: OperatorOption[] = STRING_OPERATORS;
  @Input() numberOperators: OperatorOption[] = NUMBER_OPERATORS;

  @Output() propertyChange = new EventEmitter<string | undefined>();
  @Output() operatorChange = new EventEmitter<AttributeOperator | undefined>();
  @Output() valueChange = new EventEmitter<AttributeValue>();
  @Output() remove = new EventEmitter<void>();

  protected readonly attributeControl = new FormControl('', { nonNullable: true });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attribute']) {
      const currentProperty = this.attribute?.property ?? '';
      if (this.attributeControl.value !== currentProperty) {
        this.attributeControl.setValue(currentProperty, { emitEvent: false });
      }

      if (
        currentProperty &&
        !this.availableAttributes.some((attr) => attr.property === currentProperty)
      ) {
        this.attributeControl.setValue('', { emitEvent: false });
      }
    }
  }

  protected filterAttributes(query: string | null): EventProperty[] {
    const search = (query ?? '').toLowerCase();
    return this.availableAttributes.filter((attr) => attr.property.toLowerCase().includes(search));
  }

  protected getOperatorOptions(): OperatorOption[] {
    if (this.attribute?.propertyType === 'number') {
      return this.numberOperators;
    }

    return this.stringOperators;
  }

  protected onAttributeSelected(property: string): void {
    this.propertyChange.emit(property);
  }

  protected clearAttribute(): void {
    this.attributeControl.setValue('', { emitEvent: false });
    this.propertyChange.emit(undefined);
  }

  protected onOperatorSelected(operator: AttributeOperator | null): void {
    this.operatorChange.emit(operator ?? undefined);
  }

  protected getOperatorOption(operator?: AttributeOperator): OperatorOption | undefined {
    return this.getOperatorOptions().find((option) => option.value === operator);
  }

  protected shouldShowSingleValueInput(): boolean {
    const option = this.getOperatorOption(this.attribute?.operator);
    return option?.valueRequirement === 'single';
  }

  protected shouldShowRangeInput(): boolean {
    const option = this.getOperatorOption(this.attribute?.operator);
    return option?.valueRequirement === 'range';
  }

  protected getInputType(): 'text' | 'number' {
    const option = this.getOperatorOption(this.attribute?.operator);
    return option?.inputType ?? 'text';
  }

  protected getSingleValue(): string | number | undefined {
    if (this.attribute?.value === undefined) {
      return undefined;
    }

    if (typeof this.attribute.value === 'string' || typeof this.attribute.value === 'number') {
      return this.attribute.value;
    }

    return undefined;
  }

  protected onSingleValueChange(rawValue: string): void {
    const option = this.getOperatorOption(this.attribute?.operator);
    if (!option) {
      this.valueChange.emit(undefined);
      return;
    }

    if (option.inputType === 'number') {
      if (rawValue === '') {
        this.valueChange.emit(undefined);
        return;
      }

      const numericValue = Number(rawValue);
      this.valueChange.emit(Number.isFinite(numericValue) ? numericValue : undefined);
      return;
    }

    this.valueChange.emit(rawValue === '' ? undefined : rawValue);
  }

  protected getRangeValue(part: 'from' | 'to'): number | null {
    const range = this.asRangeValue();
    return (range[part] ?? null) as number | null;
  }

  protected onRangeChange(part: 'from' | 'to', rawValue: string): void {
    const numericValue = rawValue === '' ? null : Number(rawValue);
    const sanitized = numericValue !== null && !Number.isFinite(numericValue) ? null : numericValue;
    const current = this.asRangeValue();
    const next: RangeValue = { ...current, [part]: sanitized };
    this.valueChange.emit(next);
  }

  private asRangeValue(): RangeValue {
    const value = this.attribute?.value;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const range = value as RangeValue;
      return { from: range.from ?? null, to: range.to ?? null };
    }

    return { from: null, to: null };
  }
}

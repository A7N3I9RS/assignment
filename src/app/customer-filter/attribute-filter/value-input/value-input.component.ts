import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AttributeFilter, AttributeValue, RangeValue, ValueRequirement } from '../../models';

@Component({
  selector: 'app-value-input',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './value-input.component.html',
  styleUrl: './value-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueInputComponent {
  readonly attribute = input.required<AttributeFilter>();
  readonly valueRequirement = input<ValueRequirement>('none');
  readonly inputType = input<'text' | 'number'>('text');

  readonly valueChange = output<AttributeValue>();

  readonly singleValue = computed(() => {
    const value = this.attribute().value;
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    return undefined;
  });

  readonly rangeValue = computed<RangeValue>(() => {
    const value = this.attribute().value;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const range = value as RangeValue;
      return { from: range.from ?? null, to: range.to ?? null };
    }

    return { from: null, to: null };
  });

  onSingleValueChange(event: Event): void {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    const rawValue = target?.value ?? '';
    const inputType = this.inputType();

    if (inputType === 'number') {
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

  onRangeChange(part: 'from' | 'to', event: Event): void {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    const rawValue = target?.value ?? '';
    const numericValue = rawValue === '' ? null : Number(rawValue);
    const sanitized = numericValue !== null && !Number.isFinite(numericValue) ? null : numericValue;
    const current = this.rangeValue();
    const next: RangeValue = { ...current, [part]: sanitized };
    this.valueChange.emit(next);
  }
}
